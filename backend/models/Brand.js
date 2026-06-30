const mongoose = require('mongoose');

const brandSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Vui lòng nhập tên thương hiệu'],
      unique: true,
      trim: true,
    },
    slug: { type: String, unique: true },
    description: { type: String, default: '' },
    logo: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

brandSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-');
  }
  next();
});

module.exports = mongoose.model('Brand', brandSchema);
