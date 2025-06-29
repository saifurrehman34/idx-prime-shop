'use server';

import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const CategorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  image_url: z.string().url('A valid image URL is required.'),
  data_ai_hint: z.string().min(1, 'AI Hint is required'),
});

type FormState = {
  message: string;
  success: boolean;
  errors?: Record<string, string[] | undefined>;
};

export async function addCategory(prevState: FormState, formData: FormData): Promise<FormState> {
  const validatedFields = CategorySchema.safeParse({
    name: formData.get('name'),
    image_url: formData.get('image_url'),
    data_ai_hint: formData.get('data_ai_hint'),
  });

  if (!validatedFields.success) {
    return {
      message: 'Please check the form for errors.',
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from('categories').insert(validatedFields.data);

  if (error) {
    console.error('Error adding category:', error);
    return {
      message: `Failed to add category: ${error.message}`,
      success: false,
    };
  }

  revalidatePath('/admin/categories');
  revalidatePath('/products', 'layout');
  revalidatePath('/');
  redirect('/admin/categories');
}

export async function updateCategory(id: string, prevState: FormState, formData: FormData): Promise<FormState> {
  const validatedFields = CategorySchema.safeParse({
    name: formData.get('name'),
    image_url: formData.get('image_url'),
    data_ai_hint: formData.get('data_ai_hint'),
  });

  if (!validatedFields.success) {
    return {
      message: 'Please check the form for errors.',
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from('categories').update(validatedFields.data).eq('id', id);

  if (error) {
    console.error('Error updating category:', error);
    return {
      message: `Failed to update category: ${error.message}`,
      success: false,
    };
  }

  revalidatePath('/admin/categories');
  revalidatePath('/products', 'layout');
  revalidatePath('/');
  redirect('/admin/categories');
}

export async function deleteCategory(id: string) {
    const supabase = createAdminClient();
    
    const { count, error: checkError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('category_id', id);
      
    if (checkError) {
        console.error("Error checking for products in category:", checkError);
        return { success: false, message: `Failed to check for associated products: ${checkError.message}` };
    }
    
    if (count && count > 0) {
        return { success: false, message: `Cannot delete category. ${count} product(s) are currently assigned to it.` };
    }

    const { error } = await supabase.from('categories').delete().eq('id', id);

    if (error) {
        console.error("Error deleting category:", error);
        return { success: false, message: `Failed to delete category: ${error.message}` };
    }

    revalidatePath('/admin/categories');
    revalidatePath('/products', 'layout');
    revalidatePath('/');
    return { success: true, message: 'Category deleted successfully.' };
}
