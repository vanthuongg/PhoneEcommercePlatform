const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    image: { type: String },
    imageUrl: { type: String },
    link: { type: String, default: '/shop' },
    type: {
      type: String,
      enum: ['hero', 'flash_sale', 'event', 'popup'],
      default: 'hero',
    },
    position: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date },
  },
  { 
    timestamps: true,
    toJSON: { 
      virtuals: true,
      transform: function(doc, ret) {
        ret.imageUrl = ret.imageUrl || ret.image || '';
        ret.image = ret.image || ret.imageUrl || '';
        return ret;
      }
    },
    toObject: { virtuals: true }
  }
);

module.exports = mongoose.model('Banner', bannerSchema);
