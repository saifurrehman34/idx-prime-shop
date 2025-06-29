'use server';

import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const ProductSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  long_description: z.string().min(1, 'Long description is required'),
  price: z.coerce.number().min(0, 'Price must be a positive number'),
  category_id: z.string().uuid('Please select a valid category'),
  image_url: z.string().url('Please enter a valid image URL'),
  data_ai_hint: z.string().min(1, 'AI Hint is required'),
  is_featured: z.boolean(),
  is_best_seller: z.boolean(),
});

type FormState = {
  message: string;
  success: boolean;
  errors?: Record<string, string[] | undefined>;
};

export async function addProduct(prevState: FormState, formData: FormData): Promise<FormState> {
  const supabase = createAdminClient();
  
  const validatedFields = ProductSchema.safeParse({
    name: formData.get('name'),
    description: formData.get('description'),
    long_description: formData.get('long_description'),
    price: formData.get('price'),
    category_id: formData.get('category_id'),
    image_url: formData.get('image_url'),
    data_ai_hint: formData.get('data_ai_hint'),
    is_featured: formData.get('is_featured') === 'on',
    is_best_seller: formData.get('is_best_seller') === 'on',
  });
  
  if (!validatedFields.success) {
    return {
      message: 'Please check the form for errors.',
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { error } = await supabase.from('products').insert(validatedFields.data);

  if (error) {
    console.error('Error adding product:', error);
    return {
      message: `Failed to add product: ${error.message}`,
      success: false,
    };
  }
  
  revalidatePath('/admin/products');
  revalidatePath('/');
  revalidatePath('/products/[id]', 'page');
  
  // Using redirect here will throw an error, so we signal success and redirect on client
  return {
    message: 'Product added successfully!',
    success: true,
  }
}

export async function updateProduct(id: string, prevState: FormState, formData: FormData): Promise<FormState> {
  const supabase = createAdminClient();
  
  const validatedFields = ProductSchema.safeParse({
    name: formData.get('name'),
    description: formData.get('description'),
    long_description: formData.get('long_description'),
    price: formData.get('price'),
    category_id: formData.get('category_id'),
    image_url: formData.get('image_url'),
    data_ai_hint: formData.get('data_ai_hint'),
    is_featured: formData.get('is_featured') === 'on',
    is_best_seller: formData.get('is_best_seller') === 'on',
  });
  
  if (!validatedFields.success) {
    return {
      message: 'Please check the form for errors.',
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { error } = await supabase.from('products').update(validatedFields.data).eq('id', id);

  if (error) {
    console.error('Error updating product:', error);
    return {
      message: `Failed to update product: ${error.message}`,
      success: false,
    };
  }
  
  revalidatePath('/admin/products');
  revalidatePath(`/products/${id}`);
  
  return {
      message: 'Product updated successfully!',
      success: true,
  }
}

export async function deleteProduct(id: string) {
    const supabase = createAdminClient();
    const { error } = await supabase.from('products').delete().eq('id', id);

    if (error) {
        console.error("Error deleting product:", error);
        return { success: false, message: `Failed to delete product: ${error.message}` };
    }

    revalidatePath('/admin/products');
    revalidatePath('/');
    return { success: true, message: 'Product deleted successfully.' };
}
