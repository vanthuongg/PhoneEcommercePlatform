const Banner = require('../models/Banner');

exports.getBanners = async (req, res) => {
  try {
    const { type } = req.query;
    const filter = { isActive: true };
    if (type) filter.type = type;
    const banners = await Banner.find(filter).sort({ position: 1, createdAt: -1 });
    res.json({ success: true, count: banners.length, data: banners });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllBannersAdmin = async (req, res) => {
  try {
    const banners = await Banner.find().sort({ position: 1, createdAt: -1 });
    res.json({ success: true, count: banners.length, data: banners });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createBanner = async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) {
      data.imageUrl = `/uploads/${req.file.filename}`;
    }
    const banner = await Banner.create(data);
    res.status(201).json({ success: true, data: banner });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateBanner = async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) {
      data.imageUrl = `/uploads/${req.file.filename}`;
    }
    const banner = await Banner.findByIdAndUpdate(req.params.id, data, { new: true });
    if (!banner) return res.status(404).json({ success: false, message: 'Không tìm thấy banner' });
    res.json({ success: true, data: banner });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findByIdAndDelete(req.params.id);
    if (!banner) return res.status(404).json({ success: false, message: 'Không tìm thấy banner' });
    res.json({ success: true, message: 'Đã xóa banner' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
