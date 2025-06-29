'use server';

import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const UserRoleSchema = z.object({
  role: z.enum(['admin', 'user']),
});

type FormState = {
  message: string;
  success: boolean;
};

export async function updateUserRole(id: string, prevState: FormState, formData: FormData): Promise<FormState> {
  const supabase = createAdminClient();
  
  const validatedFields = UserRoleSchema.safeParse({
    role: formData.get('role'),
  });
  
  if (!validatedFields.success) {
    return {
      message: 'Invalid role selected.',
      success: false,
    };
  }

  const { role } = validatedFields.data;

  // Update in user_profiles table
  const { error: profileError } = await supabase
    .from('user_profiles')
    .update({ role })
    .eq('id', id);

  if (profileError) {
    console.error('Error updating user profile role:', profileError);
    return {
      message: `Failed to update user profile: ${profileError.message}`,
      success: false,
    };
  }
  
  revalidatePath('/admin/users');
  redirect('/admin/users');
}
