'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from './ui/input';

interface StarRatingInputProps {
  rating: number;
  setRating: (rating: number) => void;
  name?: string;
}

export function StarRatingInput({ rating, setRating, name = 'rating' }: StarRatingInputProps) {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex items-center">
      <Input type="hidden" name={name} value={rating} />
      {[...Array(5)].map((_, index) => {
        const ratingValue = index + 1;
        return (
          <label key={index} className="cursor-pointer">
            <Star
              className={cn("h-8 w-8 transition-colors", ratingValue <= (hover || rating) ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground/40")}
              onMouseEnter={() => setHover(ratingValue)}
              onMouseLeave={() => setHover(0)}
              onClick={() => setRating(ratingValue)}
            />
          </label>
        );
      })}
    </div>
  );
}
