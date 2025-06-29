'use server';

import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

type FormState = {
  message: string;
  success: boolean;
};

export async function subscribeToNewsletter(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const supabase = createClient();

  const schema = z.object({
    email: z.string().email(),
  });

  const validatedFields = schema.safeParse({
    email: formData.get('email'),
  });

  if (!validatedFields.success) {
    return {
      message: 'Please enter a valid email address.',
      success: false,
    };
  }

  const { email } = validatedFields.data;

  const { error } = await supabase
    .from('newsletter_subscribers')
    .insert({ email });

  if (error) {
    if (error.code === '23505') { // Unique constraint violation
      return {
        message: 'This email is already subscribed.',
        success: false,
      };
    }
    console.error('Error inserting email:', error);
    return {
      message: 'An error occurred. Please try again later.',
      success: false,
    };
  }

  return {
    message: 'Thank you for subscribing!',
    success: true,
  };
}
