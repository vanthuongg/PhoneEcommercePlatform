const Cart = require('../models/Cart');
const Product = require('../models/Product');

// @desc    Get user cart
// @route   GET /api/cart
// @access  Customer
const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product', 'name images price salePrice stock isActive variants brand');
    if (!cart) return res.json({ success: true, data: { items: [], totalPrice: 0 } });
    res.json({ success: true, data: cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Customer
const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1, size = 'M', color = 'Default' } = req.body;

    const product = await Product.findById(productId);
    if (!product || !product.isActive) return res.status(404).json({ success: false, message: 'Sản phẩm không tồn tại' });
    if (product.stock < quantity) return res.status(400).json({ success: false, message: 'Số lượng vượt quá tồn kho' });

    // Kiểm tra variant giá/tồn kho nếu có
    let price = product.salePrice > 0 ? product.salePrice : product.price;
    if (product.variants && product.variants.length > 0) {
      // New product schema: variants have {ram, storage, price, stock}
      // size param is used as storage (e.g. '256GB'), color is separate
      const variant = product.variants.find(
        (v) => v.storage === size || v.ram === size || v.size === size
      );
      if (variant && variant.price) price = variant.price;
    }

    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [{ product: productId, quantity, price, size, color }] });
    } else {
      const existingItem = cart.items.find((item) => item.product.toString() === productId && item.size === size && item.color === color);
      if (existingItem) {
        const newQty = existingItem.quantity + Number(quantity);
        if (newQty > product.stock) return res.status(400).json({ success: false, message: 'Số lượng vượt quá tồn kho' });
        existingItem.quantity = newQty;
      } else {
        cart.items.push({ product: productId, quantity, price, size, color });
      }
      await cart.save();
    }

    await cart.populate('items.product', 'name images price salePrice stock variants brand');
    res.json({ success: true, message: 'Thêm vào giỏ hàng thành công', data: cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/:productId
// @access  Customer
const updateCartItem = async (req, res) => {
  try {
    const { quantity, size = 'M', color = 'Default' } = req.body;
    const { productId } = req.params;

    if (quantity < 1) return res.status(400).json({ success: false, message: 'Số lượng không hợp lệ' });

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: 'Sản phẩm không tồn tại' });
    if (product.stock < quantity) return res.status(400).json({ success: false, message: 'Số lượng vượt quá tồn kho' });

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ success: false, message: 'Giỏ hàng không tồn tại' });

    const item = cart.items.find((i) => i.product.toString() === productId && (i.size === size || !i.size) && (i.color === color || !i.color));
    if (!item) return res.status(404).json({ success: false, message: 'Sản phẩm không có trong giỏ hàng' });

    item.quantity = Number(quantity);
    await cart.save();
    await cart.populate('items.product', 'name images price salePrice stock variants brand');

    res.json({ success: true, message: 'Cập nhật giỏ hàng thành công', data: cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:productId
// @access  Customer
const removeFromCart = async (req, res) => {
  try {
    const { size, color } = req.body || req.query || {};
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ success: false, message: 'Giỏ hàng không tồn tại' });

    if (size && color) {
      cart.items = cart.items.filter((i) => !(i.product.toString() === req.params.productId && i.size === size && i.color === color));
    } else {
      cart.items = cart.items.filter((i) => i.product.toString() !== req.params.productId);
    }
    await cart.save();
    await cart.populate('items.product', 'name images price salePrice stock variants brand');

    res.json({ success: true, message: 'Xóa sản phẩm khỏi giỏ hàng thành công', data: cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Customer
const clearCart = async (req, res) => {
  try {
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [], totalPrice: 0 });
    res.json({ success: true, message: 'Xóa toàn bộ giỏ hàng thành công' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getCart, addToCart, updateCartItem, removeFromCart, clearCart };
