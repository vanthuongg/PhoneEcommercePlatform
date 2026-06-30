import React, { useState } from 'react';

const ProductGallery = ({ images = [] }) => {
  const displayImages = images.length > 0 ? images : ['https://via.placeholder.com/600'];
  const [selectedImage, setSelectedImage] = useState(displayImages[0]);

  return (
    <div className="flex flex-col gap-4">
      {/* Main image */}
      <div className="aspect-square w-full rounded-2xl overflow-hidden bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-800 relative group shadow-sm">
        <img
          src={selectedImage}
          alt="Product main"
          className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      {/* Thumbnails */}
      {displayImages.length > 1 && (
        <div className="flex items-center gap-3 overflow-x-auto pb-2">
          {displayImages.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedImage(img)}
              className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                selectedImage === img
                  ? 'border-primary-600 shadow-md scale-105'
                  : 'border-transparent opacity-70 hover:opacity-100'
              }`}
            >
              <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductGallery;
