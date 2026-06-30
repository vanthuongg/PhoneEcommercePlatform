const Product = require('../models/Product');
const Category = require('../models/Category');
const { createAuditLog } = require('./auditController');

// @desc    Get all products (with filter, search, pagination)
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  try {
    const {
      page = 1, limit = 12, search, category, minPrice, maxPrice,
      sort = '-createdAt', isActive, isFeatured, brand, minStock, maxStock, size, color, ram, storage, rating
    } = req.query;

    const query = {};
    const conditions = [];

    if (search) {
      conditions.push({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { brand: { $regex: search, $options: 'i' } },
          { tags: { $regex: search, $options: 'i' } },
        ]
      });
    }
    if (ram) {
      conditions.push({
        $or: [
          { 'variants.ram': { $regex: ram, $options: 'i' } },
          { 'specs.ram': { $regex: ram, $options: 'i' } }
        ]
      });
    }
    if (storage) {
      conditions.push({
        $or: [
          { 'variants.storage': { $regex: storage, $options: 'i' } },
          { 'specs.storage': { $regex: storage, $options: 'i' } }
        ]
      });
    }
    if (color) {
      conditions.push({
        $or: [
          { 'colors.name': { $regex: color, $options: 'i' } },
          { 'variants.color': { $regex: color, $options: 'i' } }
        ]
      });
    }
    if (conditions.length > 0) {
      query.$and = conditions;
    }

    if (category) query.category = category;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (rating) {
      query.rating = { $gte: Number(rating) };
    }
    if (isActive !== undefined && isActive !== 'undefined' && isActive !== '') {
      query.isActive = isActive === 'true';
    } else if (isActive === undefined || isActive === '') {
      query.isActive = true;
    }
    if (isFeatured) query.isFeatured = isFeatured === 'true';
    if (brand) query.brand = { $regex: brand, $options: 'i' };
    if (size) query['variants.size'] = size;

    if (minStock !== undefined && maxStock !== undefined && Number(minStock) === Number(maxStock)) {
      query.stock = Number(minStock);
    } else {
      if (minStock !== undefined) { query.stock = query.stock || {}; query.stock.$gte = Number(minStock); }
      if (maxStock !== undefined) { query.stock = query.stock || {}; query.stock.$lte = Number(maxStock); }
    }

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate('category', 'name slug')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      success: true,
      data: products,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name slug')
      .populate({ path: 'reviews', populate: { path: 'user', select: 'name avatar' } });

    if (!product) return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create product
// @route   POST /api/products
// @access  Admin, Manager
const createProduct = async (req, res) => {
  try {
    const { name, description, price, oldPrice, salePrice, category, stock, brand, tags, isFeatured, variants, colors, specs } = req.body;
    let images = req.files && req.files.length > 0 ? req.files.map((f) => `/uploads/${f.filename}`) : [];
    if (images.length === 0 && req.body.images) {
      images = typeof req.body.images === 'string' ? JSON.parse(req.body.images) : req.body.images;
    }

    let parsedVariants = [];
    if (variants) {
      try { parsedVariants = typeof variants === 'string' ? JSON.parse(variants) : variants; } 
      catch (e) { return res.status(400).json({ success: false, message: 'Dữ liệu variants không hợp lệ' }); }
    }
    let parsedColors = [];
    if (colors) {
      try { parsedColors = typeof colors === 'string' ? JSON.parse(colors) : colors; } 
      catch (e) { return res.status(400).json({ success: false, message: 'Dữ liệu colors không hợp lệ' }); }
    }
    let parsedSpecs = {};
    if (specs) {
      try { parsedSpecs = typeof specs === 'string' ? JSON.parse(specs) : specs; } 
      catch (e) { return res.status(400).json({ success: false, message: 'Dữ liệu specs không hợp lệ' }); }
    }

    const product = await Product.create({
      name, description, price: Number(price), oldPrice: Number(oldPrice || 0), salePrice: Number(salePrice || 0),
      category, stock: Number(stock), brand: brand || 'No Brand', images,
      variants: parsedVariants, colors: parsedColors, specs: parsedSpecs,
      tags: tags ? (typeof tags === 'string' ? tags.split(',').map((t) => t.trim()) : tags) : [],
      isFeatured: isFeatured === 'true' || isFeatured === true,
    });

    await createAuditLog({
      user: req.user,
      action: 'CREATE_PRODUCT',
      targetEntity: 'Product',
      targetId: product._id,
      details: { name, price },
    });

    res.status(201).json({ success: true, message: 'Tạo sản phẩm thành công', data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Admin, Manager
const updateProduct = async (req, res) => {
  try {
    const { name, description, price, oldPrice, salePrice, category, stock, brand, tags, isActive, isFeatured, variants, colors, specs } = req.body;
    const updateData = { name, description, category, brand };

    if (price !== undefined) updateData.price = Number(price);
    if (oldPrice !== undefined) updateData.oldPrice = Number(oldPrice);
    if (salePrice !== undefined) updateData.salePrice = Number(salePrice);
    if (stock !== undefined) updateData.stock = Number(stock);

    if (isActive !== undefined) updateData.isActive = isActive === 'true' || isActive === true;
    if (isFeatured !== undefined) updateData.isFeatured = isFeatured === 'true' || isFeatured === true;

    if (variants) {
      try { updateData.variants = typeof variants === 'string' ? JSON.parse(variants) : variants; }
      catch (e) { return res.status(400).json({ success: false, message: 'Dữ liệu variants không hợp lệ' }); }
    }
    if (colors) {
      try { updateData.colors = typeof colors === 'string' ? JSON.parse(colors) : colors; }
      catch (e) { return res.status(400).json({ success: false, message: 'Dữ liệu colors không hợp lệ' }); }
    }
    if (specs) {
      try { updateData.specs = typeof specs === 'string' ? JSON.parse(specs) : specs; }
      catch (e) { return res.status(400).json({ success: false, message: 'Dữ liệu specs không hợp lệ' }); }
    }
    if (tags) {
      updateData.tags = typeof tags === 'string' ? tags.split(',').map((t) => t.trim()) : tags;
    }
    if (req.files && req.files.length > 0) {
      updateData.images = req.files.map((f) => `/uploads/${f.filename}`);
    } else if (req.body.images) {
      updateData.images = typeof req.body.images === 'string' ? JSON.parse(req.body.images) : req.body.images;
    }

    const product = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
    if (!product) return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });

    await createAuditLog({
      user: req.user,
      action: 'UPDATE_PRODUCT',
      targetEntity: 'Product',
      targetId: product._id,
      details: updateData,
    });

    res.json({ success: true, message: 'Cập nhật sản phẩm thành công', data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Admin
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });

    await createAuditLog({
      user: req.user,
      action: 'DELETE_PRODUCT',
      targetEntity: 'Product',
      targetId: req.params.id,
      details: { name: product.name },
    });

    res.json({ success: true, message: 'Xóa sản phẩm thành công' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update stock
// @route   PATCH /api/products/:id/stock
// @access  Admin, Manager, Staff
const updateStock = async (req, res) => {
  try {
    const { stock, variantId } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });

    if (variantId) {
      const variant = product.variants.id(variantId);
      if (variant) variant.stock = Number(stock);
    } else {
      product.stock = Number(stock);
    }
    await product.save();

    await createAuditLog({
      user: req.user,
      action: 'UPDATE_STOCK',
      targetEntity: 'Product',
      targetId: product._id,
      details: { stock },
    });

    res.json({ success: true, message: 'Cập nhật tồn kho thành công', data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getProducts, getProductById, createProduct, updateProduct, deleteProduct, updateStock };
