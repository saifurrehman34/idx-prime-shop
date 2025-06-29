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
  image_url: z.string().url('A valid image URL is required.'),
  data_ai_hint: z.string().min(1, 'AI Hint is required'),
  is_featured: z.boolean(),
  is_best_seller: z.boolean(),
});

type FormState = {
  message: string;
  success: boolean;
  errors?: Record<string, string[] | undefined>;
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function addProduct(prevState: FormState, formData: FormData): Promise<FormState> {
  const supabase = createAdminClient();
  const imageFile = formData.get('image_file') as File | null;
  let imageUrl = '';

  if (!imageFile || imageFile.size === 0) {
    return { message: 'Product image is required.', success: false, errors: { image_file: ['Product image is required.'] } };
  }
  if (imageFile.size > MAX_FILE_SIZE) {
    return { message: 'Max image size is 5MB.', success: false, errors: { image_file: ['Max image size is 5MB.'] } };
  }
  if (!ACCEPTED_IMAGE_TYPES.includes(imageFile.type)) {
     return { message: 'Only .jpg, .png, and .webp formats are supported.', success: false, errors: { image_file: ['Only .jpg, .png, and .webp formats are supported.'] } };
  }

  const fileName = `${Date.now()}-${imageFile.name.replace(/\s/g, '_')}`;
  const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(fileName, imageFile);

  if (uploadError) {
      console.error('Error uploading image:', uploadError);
      return { message: `Failed to upload image: ${uploadError.message}`, success: false };
  }

  const { data: publicUrlData } = supabase.storage
      .from('product-images')
      .getPublicUrl(fileName);

  imageUrl = publicUrlData.publicUrl;
  
  const validatedFields = ProductSchema.safeParse({
    name: formData.get('name'),
    description: formData.get('description'),
    long_description: formData.get('long_description'),
    price: formData.get('price'),
    category_id: formData.get('category_id'),
    image_url: imageUrl,
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
  
  return {
    message: 'Product added successfully!',
    success: true,
  }
}

export async function updateProduct(id: string, prevState: FormState, formData: FormData): Promise<FormState> {
  const supabase = createAdminClient();
  
  const imageFile = formData.get('image_file') as File | null;
  let imageUrl = formData.get('image_url') as string;

  if (imageFile && imageFile.size > 0) {
    if (imageFile.size > MAX_FILE_SIZE) {
        return { message: 'Max image size is 5MB.', success: false, errors: { image_file: ['Max image size is 5MB.'] } };
    }
    if (!ACCEPTED_IMAGE_TYPES.includes(imageFile.type)) {
        return { message: 'Only .jpg, .png, and .webp formats are supported.', success: false, errors: { image_file: ['Only .jpg, .png, and .webp formats are supported.'] } };
    }

    const fileName = `${Date.now()}-${imageFile.name.replace(/\s/g, '_')}`;
    const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(fileName, imageFile);

    if (uploadError) {
        console.error('Error uploading image:', uploadError);
        return { message: `Failed to upload image: ${uploadError.message}`, success: false };
    }

    const { data: publicUrlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName);

    const newImageUrl = publicUrlData.publicUrl;

    const oldImageUrl = formData.get('image_url') as string;
    if (oldImageUrl) {
      const oldImageName = oldImageUrl.split('/').pop();
      if (oldImageName) {
        const { error: deleteError } = await supabase.storage.from('product-images').remove([oldImageName]);
        if (deleteError) {
          console.error("Failed to delete old image, continuing...", deleteError);
        }
      }
    }
    imageUrl = newImageUrl;
  }
  
  const validatedFields = ProductSchema.safeParse({
    name: formData.get('name'),
    description: formData.get('description'),
    long_description: formData.get('long_description'),
    price: formData.get('price'),
    category_id: formData.get('category_id'),
    image_url: imageUrl,
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
    
    const { data: product, error: fetchError } = await supabase.from('products').select('image_url').eq('id', id).single();
    if (fetchError) {
        console.error("Error fetching product to delete its image:", fetchError);
    }

    const { error } = await supabase.from('products').delete().eq('id', id);

    if (error) {
        console.error("Error deleting product:", error);
        return { success: false, message: `Failed to delete product: ${error.message}` };
    }

    if (product?.image_url) {
      const imageName = product.image_url.split('/').pop();
      if (imageName) {
        const { error: deleteImageError } = await supabase.storage.from('product-images').remove([imageName]);
        if (deleteImageError) {
          console.error("Failed to delete product image from storage:", deleteImageError);
        }
      }
    }

    revalidatePath('/admin/products');
    revalidatePath('/');
    return { success: true, message: 'Product deleted successfully.' };
}
