const InventoryLog = require('./inventory.model');
const Product = require('../products/product.model');
const Setting = require('../settings/setting.model');
const Notification = require('../notifications/notification.model');
const { createAuditLog } = require('../audit/audit.controller');

// @desc    Lấy danh sách thẻ kho / lịch sử xuất nhập kho
// @route   GET /api/inventory/logs
// @access  Admin, Manager, Staff
exports.getInventoryLogs = async (req, res) => {
  try {
    const { page = 1, limit = 20, type, productId, supplier, reason, search } = req.query;
    const query = {};

    if (type && type !== 'all') {
      query.type = type;
    }
    if (productId) {
      query.product = productId;
    }
    if (supplier) {
      query.supplier = { $regex: supplier, $options: 'i' };
    }
    if (reason) {
      query.reason = { $regex: reason, $options: 'i' };
    }
    if (search) {
      query.$or = [
        { productName: { $regex: search, $options: 'i' } },
        { variantInfo: { $regex: search, $options: 'i' } },
        { note: { $regex: search, $options: 'i' } },
        { supplier: { $regex: search, $options: 'i' } },
        { reason: { $regex: search, $options: 'i' } },
        { userName: { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const total = await InventoryLog.countDocuments(query);
    const logs = await InventoryLog.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.json({
      success: true,
      count: logs.length,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum) || 1,
      },
      data: logs,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Tạo phiếu giao dịch kho (Nhập kho / Xuất kho / Điều chỉnh kiểm kê)
// @route   POST /api/inventory/transaction
// @access  Admin, Manager, Staff
exports.createStockTransaction = async (req, res) => {
  try {
    const { type, productId, variantId, quantity, unitPrice = 0, reason, supplier = '', note = '' } = req.body;

    if (!['import', 'export', 'adjust'].includes(type)) {
      return res.status(400).json({ success: false, message: 'Loại giao dịch kho không hợp lệ' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm trong kho' });
    }

    let beforeStock = 0;
    let afterStock = 0;
    let changeQty = 0;
    let variantInfo = 'Tất cả / Mặc định';

    if (variantId) {
      const variant = product.variants && product.variants.id(variantId);
      const color = product.colors && product.colors.id(variantId);

      if (variant) {
        beforeStock = Number(variant.stock || 0);
        variantInfo = [variant.color, variant.storage, variant.ram].filter(Boolean).join(' - ') || 'Biến thể';
      } else if (color) {
        beforeStock = Number(color.stock || 0);
        variantInfo = color.name || 'Màu sắc';
      } else {
        return res.status(404).json({ success: false, message: 'Không tìm thấy biến thể sản phẩm' });
      }
    } else {
      beforeStock = Number(product.stock || 0);
    }

    const inputQty = Number(quantity);
    if (isNaN(inputQty)) {
      return res.status(400).json({ success: false, message: 'Số lượng không hợp lệ' });
    }

    if (type === 'import') {
      if (inputQty <= 0) {
        return res.status(400).json({ success: false, message: 'Số lượng nhập kho phải lớn hơn 0' });
      }
      afterStock = beforeStock + inputQty;
      changeQty = inputQty;
    } else if (type === 'export') {
      if (inputQty <= 0) {
        return res.status(400).json({ success: false, message: 'Số lượng xuất kho phải lớn hơn 0' });
      }
      if (beforeStock < inputQty) {
        return res.status(400).json({
          success: false,
          message: `Kho hiện tại chỉ còn ${beforeStock} sản phẩm, không đủ số lượng để xuất ${inputQty}!`,
        });
      }
      afterStock = beforeStock - inputQty;
      changeQty = -inputQty;
    } else if (type === 'adjust') {
      if (inputQty < 0) {
        return res.status(400).json({ success: false, message: 'Tồn kho điều chỉnh không thể âm' });
      }
      afterStock = inputQty;
      changeQty = afterStock - beforeStock;
      if (changeQty === 0) {
        return res.status(400).json({ success: false, message: 'Số lượng mới giống hệt tồn kho hiện tại, không có thay đổi!' });
      }
    }

    if (variantId) {
      const variant = product.variants && product.variants.id(variantId);
      const color = product.colors && product.colors.id(variantId);

      if (variant) {
        variant.stock = afterStock;
      } else if (color) {
        color.stock = afterStock;
      }

      if (product.variants && product.variants.length > 0) {
        product.stock = product.variants.reduce((sum, v) => sum + Number(v.stock || 0), 0);
      } else if (product.colors && product.colors.length > 0) {
        product.stock = product.colors.reduce((sum, c) => sum + Number(c.stock || 0), 0);
      }
    } else {
      product.stock = afterStock;
    }

    await product.save();

    const settings = await Setting.findOne() || {};
    const threshold = settings.lowStockThreshold || 10;
    if (settings.lowStockNotify !== false && (type === 'export' || type === 'adjust') && product.stock <= threshold) {
      Notification.create({
        role: 'admin',
        title: `⚠️ Cảnh báo tồn kho thấp: ${product.name}`,
        message: `Sau khi ${type === 'export' ? 'xuất kho' : 'điều chỉnh'}, sản phẩm "${product.name}" chỉ còn ${product.stock} trong kho (Ngưỡng: ${threshold}).`,
        type: 'system',
        link: `/admin/inventory`,
      }).catch(console.error);
    }

    const logReason = reason || (type === 'import' ? 'Nhập kho từ nhà cung cấp' : type === 'export' ? 'Xuất kho bán hàng / Phân phối' : 'Điều chỉnh kiểm kê');
    const log = await InventoryLog.create({
      type,
      product: product._id,
      productName: product.name,
      variantId: variantId || null,
      variantInfo,
      quantity: changeQty,
      beforeStock,
      afterStock,
      unitPrice: Number(unitPrice || 0),
      totalValue: Math.abs(changeQty) * Number(unitPrice || 0),
      reason: logReason,
      supplier: supplier || '',
      note: note || '',
      user: req.user._id,
      userName: `${req.user.name} (${req.user.role === 'admin' ? 'Quản trị viên' : req.user.role === 'manager' ? 'Quản lý' : 'Nhân viên kho'})`,
    });

    await createAuditLog({
      user: req.user,
      action: 'INVENTORY_TRANSACTION',
      targetEntity: 'Product',
      targetId: product._id,
      details: { type, changeQty, beforeStock, afterStock, reason: logReason },
    });

    res.status(201).json({
      success: true,
      message: `${type === 'import' ? 'Tạo phiếu nhập kho' : type === 'export' ? 'Tạo phiếu xuất kho' : 'Điều chỉnh kho'} thành công!`,
      data: {
        product,
        log,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Lấy thống kê tổng quan cho trang quản lý kho
// @route   GET /api/inventory/stats
// @access  Admin, Manager, Staff
exports.getInventoryStats = async (req, res) => {
  try {
    const settings = await Setting.findOne();
    const threshold = settings?.lowStockThreshold || 10;
    const totalProducts = await Product.countDocuments();
    const products = await Product.find({}, 'stock price salePrice variants colors');

    let totalStock = 0;
    let totalValue = 0;
    let lowStock = 0;
    let outOfStock = 0;

    products.forEach((p) => {
      const stock = Number(p.stock || 0);
      const price = Number(p.price || 0);
      totalStock += stock;
      totalValue += stock * price;

      if (stock === 0) {
        outOfStock += 1;
      } else if (stock <= threshold) {
        lowStock += 1;
      }
    });

    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const monthLogs = await InventoryLog.find({ createdAt: { $gte: startOfMonth } });

    let monthImportQty = 0;
    let monthExportQty = 0;
    let monthImportValue = 0;

    monthLogs.forEach((log) => {
      if (log.type === 'import') {
        monthImportQty += log.quantity;
        monthImportValue += log.totalValue || 0;
      } else if (log.type === 'export') {
        monthExportQty += Math.abs(log.quantity);
      }
    });

    res.json({
      success: true,
      data: {
        totalProducts,
        totalStock,
        totalValue,
        lowStock,
        outOfStock,
        monthImportQty,
        monthExportQty,
        monthImportValue,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
