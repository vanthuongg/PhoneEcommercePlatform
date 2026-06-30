const mongoose = require('mongoose');

const variantSchema = new mongoose.Schema({
  color: { type: String, required: true },
  storage: { type: String, required: true },
  ram: { type: String, default: '' },
  price: { type: Number, required: true },
  stock: { type: Number, required: true, min: 0, default: 0 },
});

const colorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  images: [{ type: String }],
  stock: { type: Number, default: 10 },
});

const specsSchema = new mongoose.Schema({
  cpu: { type: String, default: '' },
  ram: { type: String, default: '' },
  camera: { type: String, default: '' },
  battery: { type: String, default: '' },
  screen: { type: String, default: '' },
  storage: { type: String, default: '' },
}, { _id: false });

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Vui lòng nhập tên sản phẩm'],
      trim: true,
      maxlength: [200, 'Tên sản phẩm không vượt quá 200 ký tự'],
    },
    slug: { type: String, unique: true },
    description: { type: String, required: [true, 'Vui lòng nhập mô tả sản phẩm'] },
    price: {
      type: Number,
      required: [true, 'Vui lòng nhập giá sản phẩm'],
      min: [0, 'Giá không được âm'],
    },
    oldPrice: { type: Number, default: 0 },
    salePrice: { type: Number, default: 0 },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Vui lòng chọn danh mục'],
    },
    brand: { type: String, default: 'No Brand' },
    images: [{ type: String }],
    variants: [variantSchema],
    colors: [colorSchema],
    specs: { type: specsSchema, default: () => ({}) },
    stock: {
      type: Number,
      required: [true, 'Vui lòng nhập số lượng tồn kho'],
      min: [0, 'Số lượng không được âm'],
      default: 100,
    },
    sold: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    tags: [{ type: String }],
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

productSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'product',
});

productSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-') + '-' + Date.now();
  }
  
  if (this.variants && this.variants.length > 0) {
    this.stock = this.variants.reduce((total, variant) => total + (Number(variant.stock) || 0), 0);
  }
  
  next();
});

productSchema.index({ name: 'text', description: 'text', tags: 'text', brand: 'text' });

module.exports = mongoose.model('Product', productSchema);
