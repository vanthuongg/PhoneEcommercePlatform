const Wishlist = require('./wishlist.model');

exports.getWishlist = async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user.id }).populate('products');
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user.id, products: [] });
    }
    res.json({ success: true, data: wishlist });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.toggleWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    let wishlist = await Wishlist.findOne({ user: req.user.id });
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user.id, products: [productId] });
      return res.json({ success: true, data: wishlist, added: true });
    }

    const index = wishlist.products.indexOf(productId);
    let added = false;
    if (index > -1) {
      wishlist.products.splice(index, 1);
    } else {
      wishlist.products.push(productId);
      added = true;
    }
    await wishlist.save();
    await wishlist.populate('products');
    res.json({ success: true, data: wishlist, added });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
