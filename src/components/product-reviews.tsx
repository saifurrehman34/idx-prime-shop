'use client';

import { useState, useEffect, useRef } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Textarea } from './ui/textarea';
import { Star } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { StarRatingInput } from './star-rating-input';
import { addReview } from '@/app/products/[id]/actions';
import type { ReviewWithAuthor } from '@/types';
import { Label } from './ui/label';
import { Loader2 } from 'lucide-react';

interface ProductReviewsProps {
  productId: string;
  reviews: ReviewWithAuthor[];
  isUserLoggedIn: boolean;
  hasPurchased: boolean;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {pending ? 'Submitting...' : 'Submit Review'}
    </Button>
  );
}

function ReviewForm({ productId, hasPurchased }: { productId: string, hasPurchased: boolean }) {
    const [rating, setRating] = useState(0);
    const { toast } = useToast();
    const formRef = useRef<HTMLFormElement>(null);
    const [state, formAction] = useFormState(addReview, { message: '', success: false, errors: {} });

    useEffect(() => {
        if (state.message) {
            if (state.success) {
                toast({ title: 'Success!', description: state.message });
                formRef.current?.reset();
                setRating(0);
            } else {
                toast({ variant: 'destructive', title: 'Error', description: state.message });
            }
        }
    }, [state, toast]);

    if (!hasPurchased) {
        return (
            <div className="p-4 rounded-md border bg-muted/50 text-center text-sm text-muted-foreground">
                You must purchase this product to leave a review.
            </div>
        )
    }

    return (
        <form ref={formRef} action={formAction} className="space-y-4">
            <input type="hidden" name="productId" value={productId} />
            <div>
                <Label>Your Rating</Label>
                <StarRatingInput rating={rating} setRating={setRating} />
                {state.errors?.rating && <p className="text-sm text-destructive mt-1">{state.errors.rating[0]}</p>}
            </div>
             <div>
                <Label htmlFor="comment">Your Review</Label>
                <Textarea id="comment" name="comment" rows={4} placeholder="What did you like or dislike?" />
                {state.errors?.comment && <p className="text-sm text-destructive mt-1">{state.errors.comment[0]}</p>}
            </div>
            <SubmitButton />
        </form>
    );
}

export function ProductReviews({ productId, reviews, isUserLoggedIn, hasPurchased }: ProductReviewsProps) {
  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0 ? reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews : 0;
  
  const ratingDistribution = [5, 4, 3, 2, 1].map(star => {
    const count = reviews.filter(r => r.rating === star).length;
    return {
      star,
      count,
      percentage: totalReviews > 0 ? (count / totalReviews) * 100 : 0,
    };
  });

  return (
    <div className="grid md:grid-cols-12 gap-12">
      {/* Ratings Summary */}
      <div className="md:col-span-5">
        <h3 className="text-2xl font-semibold mb-4">Customer Reviews</h3>
        <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center">
                {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`w-6 h-6 ${i < Math.round(averageRating) ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground/40'}`} />
                ))}
            </div>
            <p className="font-semibold text-lg">{averageRating.toFixed(1)} out of 5</p>
        </div>
        <p className="text-muted-foreground text-sm mb-6">{totalReviews} customer ratings</p>
        <div className="space-y-2">
            {ratingDistribution.map(item => (
                <div key={item.star} className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">{item.star} star</span>
                    <Progress value={item.percentage} className="w-full h-2" />
                    <span className="text-sm text-muted-foreground w-12 text-right">{item.percentage.toFixed(0)}%</span>
                </div>
            ))}
        </div>

        <div className="mt-8 border-t pt-8">
            <h4 className="text-lg font-semibold mb-2">Review this product</h4>
            <p className="text-sm text-muted-foreground mb-4">Share your thoughts with other customers</p>
            {isUserLoggedIn ? (
                <ReviewForm productId={productId} hasPurchased={hasPurchased} />
            ) : (
                <div className="p-4 rounded-md border bg-muted/50 text-center">
                   <p className="text-sm text-muted-foreground">Please <a href="/login" className="underline font-semibold">log in</a> to write a review.</p>
                </div>
            )}
        </div>
      </div>

      {/* Individual Reviews */}
      <div className="md:col-span-7">
        {reviews.length > 0 ? (
          <div className="space-y-8">
            {reviews.map(review => (
              <div key={review.id} className="flex gap-4">
                 <Avatar>
                    <AvatarImage src={review.user_profiles?.avatar_url || undefined} alt={review.user_profiles?.full_name || 'User'} />
                    <AvatarFallback>{(review.user_profiles?.full_name || 'U').charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                    <p className="font-semibold">{review.user_profiles?.full_name || 'Anonymous'}</p>
                     <div className="flex items-center gap-2 my-1">
                        <div className="flex items-center">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground/40'}`} />
                            ))}
                        </div>
                        <p className="text-sm text-muted-foreground">{format(new Date(review.created_at), 'PPP')}</p>
                    </div>
                    <p className="text-foreground leading-relaxed">{review.comment}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
            <div className="h-full flex items-center justify-center text-center text-muted-foreground">
                <p>No reviews yet. Be the first to review this product!</p>
            </div>
        )}
      </div>
    </div>
  );
}
