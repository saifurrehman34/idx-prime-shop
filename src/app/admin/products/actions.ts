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
  image_url: z.string().min(1, 'At least one image is required.'), // Now stores a JSON string array of URLs
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

async function uploadImages(files: File[]): Promise<string[]> {
    const supabase = createAdminClient();
    const uploadedUrls: string[] = [];

    for (const file of files) {
        if (file.size === 0) continue;
        if (file.size > MAX_FILE_SIZE) throw new Error('Max image size is 5MB.');
        if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) throw new Error('Only .jpg, .png, and .webp formats are supported.');

        const fileName = `${Date.now()}-${file.name.replace(/\s/g, '_')}`;
        const { error: uploadError } = await supabase.storage
            .from('product-images')
            .upload(fileName, file);

        if (uploadError) {
            console.error('Error uploading image:', uploadError);
            throw new Error(`Failed to upload image: ${uploadError.message}`);
        }

        const { data: publicUrlData } = supabase.storage
            .from('product-images')
            .getPublicUrl(fileName);
        
        uploadedUrls.push(publicUrlData.publicUrl);
    }

    return uploadedUrls;
}

export async function addProduct(prevState: FormState, formData: FormData): Promise<FormState> {
    const imageFiles = formData.getAll('image_file') as File[];
    let imageUrlJson = '';

    if (!imageFiles || imageFiles.every(f => f.size === 0)) {
        return { message: 'Product image is required.', success: false, errors: { image_file: ['Product image is required.'] } };
    }

    try {
        const newImageUrls = await uploadImages(imageFiles);
        imageUrlJson = JSON.stringify(newImageUrls);
    } catch (error: any) {
        return { message: error.message, success: false, errors: { image_file: [error.message] } };
    }
  
    const validatedFields = ProductSchema.safeParse({
        name: formData.get('name'),
        description: formData.get('description'),
        long_description: formData.get('long_description'),
        price: formData.get('price'),
        category_id: formData.get('category_id'),
        image_url: imageUrlJson,
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

    const supabase = createAdminClient();
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
    revalidatePath('/products', 'layout');
  
    return {
        message: 'Product added successfully!',
        success: true,
    }
}

export async function updateProduct(id: string, prevState: FormState, formData: FormData): Promise<FormState> {
    const imageFiles = formData.getAll('image_file') as File[];
    const existingImageUrlJson = formData.get('image_url') as string;
    let finalImageUrls: string[] = [];

    try {
        finalImageUrls = existingImageUrlJson ? JSON.parse(existingImageUrlJson) : [];
    } catch (e) {
        // Handle cases where old URL is not a JSON string
        if (typeof existingImageUrlJson === 'string' && existingImageUrlJson.startsWith('http')) {
             finalImageUrls = [existingImageUrlJson];
        }
    }

    const hasNewFiles = imageFiles.some(f => f.size > 0);

    if (hasNewFiles) {
        try {
            const newImageUrls = await uploadImages(imageFiles);
            // A simple strategy: replace old images with new ones.
            // A more complex one could be to allow removing specific images.
            
            // For now, let's just replace. Delete old ones first.
            const oldImageNames = finalImageUrls.map(url => url.split('/').pop()).filter(Boolean) as string[];
            if (oldImageNames.length > 0) {
                 const { error: deleteError } = await createAdminClient().storage.from('product-images').remove(oldImageNames);
                 if (deleteError) console.error("Failed to delete old images, continuing...", deleteError);
            }
            finalImageUrls = newImageUrls;
        } catch (error: any) {
             return { message: error.message, success: false, errors: { image_file: [error.message] } };
        }
    }
    
    const validatedFields = ProductSchema.safeParse({
        name: formData.get('name'),
        description: formData.get('description'),
        long_description: formData.get('long_description'),
        price: formData.get('price'),
        category_id: formData.get('category_id'),
        image_url: JSON.stringify(finalImageUrls),
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

    const supabase = createAdminClient();
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
    revalidatePath('/');
  
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
      try {
        const imageUrls = JSON.parse(product.image_url);
        if (Array.isArray(imageUrls)) {
          const imageNames = imageUrls.map(url => url.split('/').pop()).filter(Boolean);
          if (imageNames.length > 0) {
            const { error: deleteImageError } = await supabase.storage.from('product-images').remove(imageNames);
            if (deleteImageError) {
              console.error("Failed to delete product images from storage:", deleteImageError);
            }
          }
        }
      } catch (e) {
          // Fallback for old single URL format
          const imageName = product.image_url.split('/').pop();
          if (imageName) {
            await supabase.storage.from('product-images').remove([imageName]);
          }
      }
    }

    revalidatePath('/admin/products');
    revalidatePath('/');
    return { success: true, message: 'Product deleted successfully.' };
}
