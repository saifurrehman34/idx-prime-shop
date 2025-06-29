'use server';

import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

const AddressSchema = z.object({
  address_line_1: z.string().min(1, 'Address is required'),
  address_line_2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  postal_code: z.string().min(1, 'Postal code is required'),
  country: z.string().min(1, 'Country is required'),
});

type FormState = {
  message: string;
  success: boolean;
  errors?: Record<string, string[] | undefined>;
};

async function getUserId(): Promise<string | null> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id || null;
}

export async function addAddress(prevState: FormState, formData: FormData): Promise<FormState> {
  const userId = await getUserId();
  if (!userId) return { message: 'You must be logged in.', success: false };

  const validatedFields = AddressSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      message: 'Please check the form for errors.',
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const supabase = createClient();
  const { error } = await supabase.from('addresses').insert({
    ...validatedFields.data,
    user_id: userId,
  });

  if (error) {
    console.error('Error adding address:', error);
    return { message: `Failed to add address: ${error.message}`, success: false };
  }

  revalidatePath('/user/addresses');
  revalidatePath('/user/checkout');
  return { message: 'Address added successfully!', success: true };
}

export async function updateAddress(id: string, prevState: FormState, formData: FormData): Promise<FormState> {
  const userId = await getUserId();
  if (!userId) return { message: 'You must be logged in.', success: false };
  
  const validatedFields = AddressSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      message: 'Please check the form for errors.',
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }
  
  const supabase = createClient();
  const { error } = await supabase
    .from('addresses')
    .update(validatedFields.data)
    .eq('id', id)
    .eq('user_id', userId);

  if (error) {
    console.error('Error updating address:', error);
    return { message: `Failed to update address: ${error.message}`, success: false };
  }

  revalidatePath('/user/addresses');
  revalidatePath('/user/checkout');
  return { message: 'Address updated successfully!', success: true };
}


export async function deleteAddress(id: string) {
  const userId = await getUserId();
  if (!userId) return { success: false, message: 'You must be logged in.' };

  const supabase = createClient();
  const { error } = await supabase
    .from('addresses')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) {
    console.error('Error deleting address:', error);
    return { success: false, message: `Failed to delete address: ${error.message}` };
  }

  revalidatePath('/user/addresses');
  revalidatePath('/user/checkout');
  return { success: true, message: 'Address deleted successfully.' };
}

export async function setDefaultAddress(id: string) {
    const userId = await getUserId();
    if (!userId) return { success: false, message: 'You must be logged in.' };

    const supabase = createClient();
    
    // Use a transaction to ensure atomicity
    const { error: transactionError } = await supabase.rpc('run' as any, async () => {
        // Step 1: Unset any current default address
        const { error: unsetError } = await supabase
            .from('addresses')
            .update({ is_default: false })
            .eq('user_id', userId)
            .eq('is_default', true);

        if (unsetError) throw unsetError;

        // Step 2: Set the new default address
        const { error: setError } = await supabase
            .from('addresses')
            .update({ is_default: true })
            .eq('id', id)
            .eq('user_id', userId);
        
        if (setError) throw setError;
    });


    if (transactionError) {
        console.error('Error setting default address:', transactionError);
        return { success: false, message: `Failed to set default address: ${transactionError.message}` };
    }

    revalidatePath('/user/addresses');
    revalidatePath('/user/checkout');
    return { success: true, message: 'Default address updated.' };
}
