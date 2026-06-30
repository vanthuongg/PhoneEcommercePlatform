import React from 'react';
import { Star } from 'lucide-react';

const RatingStars = ({ rating = 0, size = 16, showNumber = false, count = 0 }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  return (
    <div className="inline-flex items-center gap-1">
      <div className="flex items-center">
        {[...Array(5)].map((_, index) => {
          const isFull = index < fullStars;
          const isHalf = index === fullStars && hasHalfStar;
          return (
            <Star
              key={index}
              size={size}
              className={`${
                isFull || isHalf ? 'text-amber-400 fill-amber-400' : 'text-gray-300 dark:text-gray-700'
              } transition-colors`}
            />
          );
        })}
      </div>
      {showNumber && (
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">
          {rating > 0 ? rating.toFixed(1) : 'Chưa có đánh giá'} {count > 0 && `(${count})`}
        </span>
      )}
    </div>
  );
};

export default RatingStars;
