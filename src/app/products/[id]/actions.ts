'use server';

import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

const ReviewSchema = z.object({
  rating: z.coerce.number().min(1, 'Rating is required').max(5),
  comment: z.string().min(10, 'Comment must be at least 10 characters long.'),
  productId: z.string().uuid(),
});

type FormState = {
  message: string;
  success: boolean;
  errors?: Record<string, string[] | undefined>;
};

export async function addReview(prevState: FormState, formData: FormData): Promise<FormState> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { message: 'You must be logged in to leave a review.', success: false };
  }

  const validatedFields = ReviewSchema.safeParse({
    rating: formData.get('rating'),
    comment: formData.get('comment'),
    productId: formData.get('productId'),
  });

  if (!validatedFields.success) {
    return {
      message: 'Please check the form for errors.',
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }
  
  const { productId, rating, comment } = validatedFields.data;

  // Optional: Check if the user has purchased this product before allowing a review.
  const { data: hasPurchased } = await supabase.rpc('user_has_purchased_product', { p_user_id: user.id, p_product_id: productId });

  if (!hasPurchased) {
    // Note: For a better UX, you might want to allow reviews anyway or be more lenient.
    // For this example, we'll be strict.
    return { message: 'You can only review products you have purchased.', success: false };
  }

  const { error } = await supabase.from('reviews').upsert({
    product_id: productId,
    user_id: user.id,
    rating,
    comment,
  }, { onConflict: 'user_id,product_id' }); // This allows users to update their existing review

  if (error) {
    console.error('Error adding/updating review:', error);
    if (error.code === '23505') { // This should be handled by upsert, but as a fallback.
        return { message: 'You have already reviewed this product. Your review has been updated.', success: true };
    }
    return { message: `Failed to submit review: ${error.message}`, success: false };
  }

  revalidatePath(`/products/${productId}`);
  revalidatePath('/user/reviews');

  return { message: 'Thank you for your review!', success: true };
}
