const Brand = require('./brand.model');

exports.getBrands = async (req, res) => {
  try {
    const brands = await Brand.find({ isActive: true }).sort({ name: 1 });
    res.json({ success: true, count: brands.length, data: brands });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllBrandsAdmin = async (req, res) => {
  try {
    const brands = await Brand.find().sort({ createdAt: -1 });
    res.json({ success: true, count: brands.length, data: brands });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createBrand = async (req, res) => {
  try {
    const brand = await Brand.create(req.body);
    res.status(201).json({ success: true, data: brand });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateBrand = async (req, res) => {
  try {
    const brand = await Brand.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!brand) return res.status(404).json({ success: false, message: 'Không tìm thấy thương hiệu' });
    res.json({ success: true, data: brand });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteBrand = async (req, res) => {
  try {
    const brand = await Brand.findByIdAndDelete(req.params.id);
    if (!brand) return res.status(404).json({ success: false, message: 'Không tìm thấy thương hiệu' });
    res.json({ success: true, message: 'Đã xóa thương hiệu' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
