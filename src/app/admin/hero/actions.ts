'use server';

import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const HeroSlideSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  subtitle: z.string().optional(),
  link: z.string().url('A valid URL is required for the link.'),
  image_url: z.string().url('A valid image URL is required.'),
  image_ai_hint: z.string().optional(),
  is_active: z.boolean(),
});

type FormState = {
  message: string;
  success: boolean;
  errors?: Record<string, string[] | undefined>;
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function addHeroSlide(prevState: FormState, formData: FormData): Promise<FormState> {
  const supabase = createAdminClient();
  const imageFile = formData.get('image_file') as File | null;
  let imageUrl = '';

  if (!imageFile || imageFile.size === 0) {
    return { message: 'Slide image is required.', success: false, errors: { image_file: ['Slide image is required.'] } };
  }
  if (imageFile.size > MAX_FILE_SIZE) {
    return { message: 'Max image size is 5MB.', success: false, errors: { image_file: ['Max image size is 5MB.'] } };
  }
  if (!ACCEPTED_IMAGE_TYPES.includes(imageFile.type)) {
     return { message: 'Only .jpg, .png, and .webp formats are supported.', success: false, errors: { image_file: ['Only .jpg, .png, and .webp formats are supported.'] } };
  }

  const fileName = `hero-${Date.now()}-${imageFile.name.replace(/\s/g, '_')}`;
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
  
  const validatedFields = HeroSlideSchema.safeParse({
    title: formData.get('title'),
    subtitle: formData.get('subtitle'),
    link: formData.get('link'),
    image_url: imageUrl,
    image_ai_hint: formData.get('image_ai_hint'),
    is_active: formData.get('is_active') === 'on',
  });
  
  if (!validatedFields.success) {
    return {
      message: 'Please check the form for errors.',
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { error } = await supabase.from('hero_slides').insert(validatedFields.data);

  if (error) {
    console.error('Error adding hero slide:', error);
    return {
      message: `Failed to add slide: ${error.message}`,
      success: false,
    };
  }
  
  revalidatePath('/admin/hero');
  revalidatePath('/');
  
  return {
    message: 'Hero slide added successfully!',
    success: true,
  }
}

export async function updateHeroSlide(id: string, prevState: FormState, formData: FormData): Promise<FormState> {
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

    const fileName = `hero-${Date.now()}-${imageFile.name.replace(/\s/g, '_')}`;
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
  
  const validatedFields = HeroSlideSchema.safeParse({
    title: formData.get('title'),
    subtitle: formData.get('subtitle'),
    link: formData.get('link'),
    image_url: imageUrl,
    image_ai_hint: formData.get('image_ai_hint'),
    is_active: formData.get('is_active') === 'on',
  });
  
  if (!validatedFields.success) {
    return {
      message: 'Please check the form for errors.',
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { error } = await supabase.from('hero_slides').update(validatedFields.data).eq('id', id);

  if (error) {
    console.error('Error updating hero slide:', error);
    return {
      message: `Failed to update slide: ${error.message}`,
      success: false,
    };
  }
  
  revalidatePath('/admin/hero');
  revalidatePath('/');
  
  return {
      message: 'Hero slide updated successfully!',
      success: true,
  }
}

export async function deleteHeroSlide(id: string) {
    const supabase = createAdminClient();
    
    const { data: slide, error: fetchError } = await supabase.from('hero_slides').select('image_url').eq('id', id).single();
    if (fetchError) {
        console.error("Error fetching slide to delete its image:", fetchError);
    }

    const { error } = await supabase.from('hero_slides').delete().eq('id', id);

    if (error) {
        console.error("Error deleting slide:", error);
        return { success: false, message: `Failed to delete slide: ${error.message}` };
    }

    if (slide?.image_url) {
      const imageName = slide.image_url.split('/').pop();
      if (imageName) {
        const { error: deleteImageError } = await supabase.storage.from('product-images').remove([imageName]);
        if (deleteImageError) {
          console.error("Failed to delete slide image from storage:", deleteImageError);
        }
      }
    }

    revalidatePath('/admin/hero');
    revalidatePath('/');
    return { success: true, message: 'Hero slide deleted successfully.' };
}
