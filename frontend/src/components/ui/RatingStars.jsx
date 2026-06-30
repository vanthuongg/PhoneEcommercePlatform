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
                isFull || isHalf ? 'text-amber-400 fill-amber-400' : 'text-slate-300 dark:text-slate-700'
              } transition-colors drop-shadow-sm`}
            />
          );
        })}
      </div>
      {showNumber && (
        <span className="text-sm font-medium text-slate-600 dark:text-slate-400 ml-1.5">
          {rating > 0 ? rating.toFixed(1) : 'Chưa có đánh giá'} {count > 0 && <span className="text-slate-400 dark:text-slate-500">({count})</span>}
        </span>
      )}
    </div>
  );
};

export default RatingStars;
