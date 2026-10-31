import React from 'react';
import { Star } from 'lucide-react';

interface RatingStarsProps {
  rating: number; // 0 - 5
  reviewsCount?: number;
  size?: 'sm' | 'md' | 'lg';
  showNumber?: boolean;
  max?: number;
}

export const RatingStars: React.FC<RatingStarsProps> = ({
  rating,
  reviewsCount,
  size = 'md',
  showNumber = true,
  max = 5,
}) => {
  const sizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center text-amber-400">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizes[size]} ${
              star <= Math.round(rating)
                ? 'fill-amber-400 text-amber-400'
                : 'text-slate-600 fill-slate-800'
            }`}
          />
        ))}
      </div>
      {showNumber && (
        <span className="text-xs font-bold text-slate-200">
          {rating > 0 ? rating.toFixed(1) : 'New'}
        </span>
      )}
      {reviewsCount !== undefined && (
        <span className="text-xs text-slate-400">({reviewsCount})</span>
      )}
    </div>
  );
};
