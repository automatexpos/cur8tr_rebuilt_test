import StarRating from '../StarRating';
import { useState } from 'react';

export default function StarRatingExample() {
  const [rating, setRating] = useState(3);

  return (
    <div className="space-y-6 p-6">
      <div>
        <p className="text-sm text-muted-foreground mb-2">Static display:</p>
        <StarRating rating={4} />
      </div>
      
      <div>
        <p className="text-sm text-muted-foreground mb-2">Interactive (click to rate):</p>
        <StarRating 
          rating={rating} 
          interactive 
          onChange={(newRating) => {
            setRating(newRating);
            console.log('New rating:', newRating);
          }} 
        />
        <p className="text-sm mt-2">Current rating: {rating}</p>
      </div>

      <div>
        <p className="text-sm text-muted-foreground mb-2">Large size:</p>
        <StarRating rating={5} size="lg" />
      </div>
    </div>
  );
}
