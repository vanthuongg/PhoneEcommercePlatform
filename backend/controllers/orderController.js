const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Voucher = require('../models/Voucher');
const Notification = require('../models/Notification');
const User = require('../models/User');
const Setting = require('../models/Setting');
const emailService = require('../services/emailService');
const { createAuditLog } = require('./auditController');
const mongoose = require('mongoose');

// Helper tên trạng thái tiếng Việt
const statusTitles = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  processing: 'Đang đóng gói',
  shipping: 'Đang giao hàng',
  delivered: 'Giao thành công',
  cancelled: 'Đã hủy đơn',
};

// @desc    Create order from cart
// @route   POST /api/orders
// @access  Customer
const createOrder = async (req, res) => {
  let session = null;
  let isTxActive = false;
  
  try {
    const topologyType = mongoose.connection.client.topology.description.type;
    if (topologyType !== 'Single') {
      session = await mongoose.startSession();
      session.startTransaction();
      isTxActive = true;
    }
  } catch (err) {
    console.warn("Transactions not supported, running without transaction.");
  }

  try {
    const { shippingAddress = {}, paymentMethod, note, voucherCode } = req.body;
    if (!shippingAddress.email && req.user && req.user.email) {
      shippingAddress.email = req.user.email;
    }

    const cart = await Cart.findOne({ user: req.user._id })
      .populate('items.product')
      .session(isTxActive ? session : null);
      
    if (!cart || cart.items.length === 0) {
      throw new Error('Giỏ hàng trống');
    }

    // Check stock
    for (const item of cart.items) {
      if (!item.product.isActive) {
        throw new Error(`Sản phẩm "${item.product.name}" không còn bán`);
      }
      if (item.product.stock < item.quantity) {
        throw new Error(`Sản phẩm "${item.product.name}" không đủ hàng`);
      }
    }

    const orderItems = cart.items.map((item) => ({
      product: item.product._id,
      name: item.product.name,
      quantity: item.quantity,
      price: item.price,
      size: item.size || 'M',
      color: item.color || 'Default',
      image: item.product.images[0] || '',
    }));

    const itemsTotal = cart.totalPrice;
    let shippingFee = itemsTotal >= 300000 ? 0 : 30000;
    let discount = 0;
    let freeshipDiscount = 0;
    let platformDiscount = 0;
    let shopDiscount = 0;
    let finalAppliedVouchers = [];
    let voucherCodesList = [];

    // Hỗ trợ combo voucher chuẩn hệ thống TechPhone Store (stacking)
    const vouchersToProcess = req.body.appliedVouchers || [];
    if (vouchersToProcess.length > 0) {
      for (const item of vouchersToProcess) {
        if (!item.code) continue;
        const v = await Voucher.findOne({ code: item.code.toUpperCase(), isActive: true })
          .session(isTxActive ? session : null);
        if (v) {
          const disc = Number(item.discountAmount) || 0;
          if (item.scope === 'platform_freeship' || v.discountType === 'freeship' || v.tag === 'shipping') {
            freeshipDiscount += disc || shippingFee;
            shippingFee = Math.max(0, shippingFee - (disc || shippingFee));
          } else if (item.scope === 'shop_discount' || v.applicableTo === 'brand' || v.tag === 'brand') {
            shopDiscount += disc;
            discount += disc;
          } else {
            platformDiscount += disc;
            discount += disc;
          }
          finalAppliedVouchers.push({
            code: v.code,
            scope: item.scope || v.scope || 'platform_discount',
            title: v.title,
            discountAmount: disc,
            brand: item.brand || '',
          });
          voucherCodesList.push(v.code);
          // Tăng lượt sử dụng
          v.usedCount = (v.usedCount || 0) + 1;
          await v.save({ session: isTxActive ? session : undefined });
        }
      }
    } else if (voucherCode) {
      // Backward compatibility cho 1 mã cũ
      const appliedVoucher = await Voucher.findOne({ code: voucherCode.toUpperCase(), isActive: true })
        .session(isTxActive ? session : null);
      if (appliedVoucher) {
        if (appliedVoucher.discountType === 'freeship') {
          freeshipDiscount = shippingFee;
          shippingFee = 0;
        } else if (appliedVoucher.discountType === 'percentage') {
          discount = Math.round((itemsTotal * appliedVoucher.discountValue) / 100);
          if (appliedVoucher.maxDiscountAmount && discount > appliedVoucher.maxDiscountAmount) {
            discount = appliedVoucher.maxDiscountAmount;
          }
          platformDiscount = discount;
        } else if (appliedVoucher.discountType === 'fixed') {
          discount = appliedVoucher.discountValue;
          platformDiscount = discount;
        }
        finalAppliedVouchers.push({
          code: appliedVoucher.code,
          scope: appliedVoucher.scope || 'platform_discount',
          title: appliedVoucher.title,
          discountAmount: discount || freeshipDiscount,
          brand: '',
        });
        voucherCodesList.push(appliedVoucher.code);
        appliedVoucher.usedCount = (appliedVoucher.usedCount || 0) + 1;
        await appliedVoucher.save({ session: isTxActive ? session : undefined });
      }
    }

    const totalAmount = Math.max(0, itemsTotal + shippingFee - discount);

    const [order] = await Order.create([{
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      paymentMethod: paymentMethod || 'cod',
      itemsTotal,
      shippingFee,
      discount,
      freeshipDiscount,
      platformDiscount,
      shopDiscount,
      appliedVouchers: finalAppliedVouchers,
      voucherCode: voucherCodesList.join(', '),
      totalAmount,
      note,
      timeline: [
        {
          status: 'pending',
          title: 'Chờ xác nhận',
          description: 'Đơn hàng mới được đặt thành công, đang chờ kiểm duyệt',
          time: new Date(),
          completed: true,
        },
      ],
    }], { session: isTxActive ? session : undefined });

    const settings = (await Setting.findOne().session(isTxActive ? session : null)) || {};
    const lowStockThreshold = settings.lowStockThreshold || 10;

    for (const item of cart.items) {
      const productToUpdate = await Product.findById(item.product._id)
        .session(isTxActive ? session : null);
      if (productToUpdate) {
        let currentStock = 0;
        if (productToUpdate.variants && productToUpdate.variants.length > 0) {
          const matchingVariant = productToUpdate.variants.find(
            v => (v.storage === item.size || v.name === item.size) && v.color === item.color
          );
          if (matchingVariant) {
            if (matchingVariant.stock < item.quantity) {
              throw new Error(`Sản phẩm "${item.product.name}" variant không đủ hàng`);
            }
            matchingVariant.stock -= item.quantity;
          }
          currentStock = productToUpdate.variants.reduce((sum, v) => sum + Number(v.stock || 0), 0);
          productToUpdate.stock = currentStock;
        } else {
          productToUpdate.stock -= item.quantity;
          currentStock = productToUpdate.stock;
        }
        productToUpdate.sold = (productToUpdate.sold || 0) + item.quantity;
        await productToUpdate.save({ validateBeforeSave: false, session: isTxActive ? session : undefined });

        if (settings.lowStockNotify !== false && currentStock <= lowStockThreshold) {
          Notification.create({
            role: 'admin',
            title: `⚠️ Cảnh báo tồn kho thấp: ${productToUpdate.name}`,
            message: `Sản phẩm "${productToUpdate.name}" chỉ còn ${currentStock} sản phẩm trong kho (Ngưỡng: ${lowStockThreshold}).`,
            type: 'system',
            link: `/admin/inventory`,
          }).catch(console.error);
        }
      }
    }

    cart.items = [];
    cart.totalPrice = 0;
    await cart.save({ session: isTxActive ? session : undefined });

    const userToUpdate = await User.findById(req.user._id)
      .session(isTxActive ? session : null);
    if (userToUpdate) {
      const savedAddress = {
        name: shippingAddress.name,
        phone: shippingAddress.phone,
        street: shippingAddress.street,
        ward: shippingAddress.ward || '',
        district: shippingAddress.district || '',
        city: shippingAddress.city,
        isDefault: true,
      };
      if (userToUpdate.addresses && userToUpdate.addresses.length > 0) {
        userToUpdate.addresses[0] = savedAddress;
      } else {
        userToUpdate.addresses = [savedAddress];
      }
      await userToUpdate.save({ validateBeforeSave: false, session: isTxActive ? session : undefined });
    }

    if (isTxActive && session) {
      await session.commitTransaction();
      session.endSession();
    }

    if (settings.orderConfirmEmail !== false) {
      emailService.sendOrderConfirmationEmail(req.user, order).catch(console.error);
    }
    // Admin notification for new order removed as requested

    // Tạo thông báo cho Khách hàng
    Notification.create({
      user: req.user._id,
      title: `🎉 Đặt hàng thành công #${order.orderCode}`,
      message: `Đơn hàng trị giá ${totalAmount.toLocaleString()}đ của bạn đã được ghi nhận và đang chờ xử lý.`,
      type: 'order',
      link: `/orders/${order._id}`,
    }).catch(console.error);

    res.status(201).json({ success: true, message: 'Đặt hàng thành công', data: order });
  } catch (error) {
    if (isTxActive && session) {
      await session.abortTransaction();
      session.endSession();
    }
    const statusCode = error.message && (error.message.includes('không đủ hàng') || error.message.includes('trống')) ? 400 : 500;
    res.status(statusCode).json({ success: false, message: error.message || 'Lỗi server' });
  }
};

// @desc    Get orders
// @route   GET /api/orders
// @access  Private
const getOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, paymentStatus, search } = req.query;
    const query = {};

    if (req.user.role === 'customer') query.user = req.user._id;
    if (status) query.orderStatus = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;

    // Hỗ trợ search theo orderCode
    if (search) {
      query.orderCode = { $regex: search, $options: 'i' };
    }

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      success: true,
      data: orders,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('items.product', 'name images');

    if (!order) return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });

    if (req.user.role === 'customer' && order.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Không có quyền xem đơn hàng này' });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Staff, Manager, Admin
const updateOrderStatus = async (req, res) => {
  try {
    const { status, note } = req.body;
    const validStatuses = ['pending', 'confirmed', 'processing', 'shipping', 'delivered', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Trạng thái không hợp lệ' });
    }

    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (!order) return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });

    if (order.orderStatus === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Đơn hàng đã hủy không thể thay đổi trạng thái' });
    }
    if (order.orderStatus === 'delivered') {
      return res.status(400).json({ success: false, message: 'Đơn hàng đã giao thành công không thể thay đổi trạng thái' });
    }

    const previousStatus = order.orderStatus;
    order.orderStatus = status;
    if (status === 'delivered') {
      order.paymentStatus = 'paid';
      order.deliveredAt = Date.now();
    }

    // Restore stock if order is cancelled by staff/manager/admin
    if (status === 'cancelled' && previousStatus !== 'cancelled') {
      for (const item of order.items) {
        const productToUpdate = await Product.findById(item.product);
        if (productToUpdate) {
          if (productToUpdate.variants && productToUpdate.variants.length > 0) {
            const matchingVariant = productToUpdate.variants.find(
              v => (v.storage === item.size || v.name === item.size) && v.color === item.color
            );
            if (matchingVariant) {
              matchingVariant.stock += item.quantity;
            }
          } else {
            productToUpdate.stock += item.quantity;
          }
          productToUpdate.sold = Math.max(0, (productToUpdate.sold || 0) - item.quantity);
          await productToUpdate.save({ validateBeforeSave: false });
        }
      }

      const codesToRestore = order.appliedVouchers && order.appliedVouchers.length > 0
        ? order.appliedVouchers.map(v => v.code)
        : (order.voucherCode ? order.voucherCode.split(',').map(c => c.trim()).filter(Boolean) : []);
      
      for (const code of codesToRestore) {
        const voucher = await Voucher.findOne({ code: code.toUpperCase() });
        if (voucher && voucher.usedCount > 0) {
          voucher.usedCount -= 1;
          await voucher.save({ validateBeforeSave: false });
        }
      }
    }

    // Cập nhật timeline
    order.timeline.push({
      status,
      title: statusTitles[status] || status,
      description: note || `Đơn hàng chuyển sang trạng thái ${statusTitles[status]}`,
      time: new Date(),
      completed: true,
    });

    await order.save();

    // Gửi email shipping nếu đang giao
    if (status === 'shipping' && order.user) {
      await emailService.sendShippingNotificationEmail(order.user, order);
    }

    // Tạo thông báo cho User
    await Notification.create({
      user: order.user._id || order.user,
      title: `📦 Cập nhật đơn hàng #${order.orderCode}`,
      message: `Đơn hàng của bạn chuyển sang trạng thái: ${statusTitles[status]}`,
      type: 'order',
      link: `/orders/${order._id}`,
    });

    // Admin notification for cancelled order removed as requested

    // Ghi Audit Log
    await createAuditLog({
      user: req.user,
      action: 'UPDATE_ORDER_STATUS',
      targetEntity: 'Order',
      targetId: order._id,
      details: { status, note },
    });

    res.json({ success: true, message: 'Cập nhật trạng thái đơn hàng thành công', data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update order payment status
// @route   PUT /api/orders/:id/payment-status
// @access  Staff, Manager, Admin
const updatePaymentStatus = async (req, res) => {
  try {
    const { paymentStatus } = req.body;
    const validStatuses = ['pending', 'paid', 'failed', 'refunded'];

    if (!validStatuses.includes(paymentStatus)) {
      return res.status(400).json({ success: false, message: 'Trạng thái thanh toán không hợp lệ' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });

    order.paymentStatus = paymentStatus;

    order.timeline.push({
      status: order.orderStatus,
      title: 'Cập nhật thanh toán',
      description: `Trạng thái thanh toán được cập nhật thành: ${paymentStatus === 'paid' ? 'Đã thanh toán' : paymentStatus === 'failed' ? 'Thất bại' : paymentStatus === 'refunded' ? 'Đã hoàn tiền' : 'Chờ thanh toán'}`,
      time: new Date(),
      completed: true,
    });

    await order.save();

    await createAuditLog({
      user: req.user,
      action: 'UPDATE_PAYMENT_STATUS',
      targetEntity: 'Order',
      targetId: order._id,
      details: { paymentStatus },
    });

    res.json({ success: true, message: 'Cập nhật thanh toán thành công', data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Cancel order (customer)
// @route   PUT /api/orders/:id/cancel
// @access  Customer
const cancelOrder = async (req, res) => {
  try {
    const { cancelReason } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
    
    // Admin, manager, staff có thể hủy bất kỳ đơn hàng nào
    // Customer chỉ có thể hủy đơn của chính mình
    const isPrivilegedRole = ['admin', 'manager', 'staff'].includes(req.user.role);
    if (!isPrivilegedRole && order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Không có quyền hủy đơn hàng này' });
    }
    if (!['pending', 'confirmed'].includes(order.orderStatus)) {
      return res.status(400).json({ success: false, message: 'Không thể hủy đơn hàng ở trạng thái này' });
    }

    order.orderStatus = 'cancelled';
    order.cancelReason = cancelReason || '';
    order.timeline.push({
      status: 'cancelled',
      title: 'Đã hủy đơn',
      description: cancelReason || 'Khách hàng yêu cầu hủy đơn',
      time: new Date(),
      completed: true,
    });

    // Restore stock
    for (const item of order.items) {
      const productToUpdate = await Product.findById(item.product);
      if (productToUpdate) {
        if (productToUpdate.variants && productToUpdate.variants.length > 0) {
          const matchingVariant = productToUpdate.variants.find(
            v => (v.storage === item.size || v.name === item.size) && v.color === item.color
          );
          if (matchingVariant) {
            matchingVariant.stock += item.quantity;
          }
        } else {
          productToUpdate.stock += item.quantity;
        }
        productToUpdate.sold = Math.max(0, (productToUpdate.sold || 0) - item.quantity);
        await productToUpdate.save({ validateBeforeSave: false });
      }
    }

    const codesToRestore = order.appliedVouchers && order.appliedVouchers.length > 0
      ? order.appliedVouchers.map(v => v.code)
      : (order.voucherCode ? order.voucherCode.split(',').map(c => c.trim()).filter(Boolean) : []);
    
    for (const code of codesToRestore) {
      const voucher = await Voucher.findOne({ code: code.toUpperCase() });
      if (voucher && voucher.usedCount > 0) {
        voucher.usedCount -= 1;
        await voucher.save({ validateBeforeSave: false });
      }
    }

    await order.save();

    // Admin notification for customer cancel removed as requested

    Notification.create({
      user: order.user._id || order.user,
      title: `🚫 Đã hủy đơn hàng #${order.orderCode}`,
      message: `Đơn hàng của bạn đã được hủy thành công.`,
      type: 'order',
      link: `/orders/${order._id}`,
    }).catch(console.error);

    res.json({ success: true, message: 'Hủy đơn hàng thành công', data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createOrder, getOrders, getOrderById, updateOrderStatus, updatePaymentStatus, cancelOrder };
