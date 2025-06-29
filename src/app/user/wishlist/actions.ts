'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function toggleWishlist(productId: string) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, message: 'You must be logged in to manage your wishlist.' };
    }

    // Check if the item is already in the wishlist
    const { data: existingItem, error: fetchError } = await supabase
        .from('wishlists')
        .select('id')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .single();

    if (fetchError && fetchError.code !== 'PGRST116') { // Ignore 'exact one row not found' error
        console.error('Error fetching wishlist:', fetchError);
        return { success: false, message: 'Error checking wishlist.' };
    }

    let resultMessage = '';
    if (existingItem) {
        // Remove from wishlist
        const { error: deleteError } = await supabase
            .from('wishlists')
            .delete()
            .eq('id', existingItem.id);

        if (deleteError) {
            console.error('Error removing from wishlist:', deleteError);
            return { success: false, message: 'Could not remove from wishlist.' };
        }
        resultMessage = 'Removed from wishlist.';
    } else {
        // Add to wishlist
        const { error: insertError } = await supabase
            .from('wishlists')
            .insert({ user_id: user.id, product_id: productId });
        
        if (insertError) {
            console.error('Error adding to wishlist:', insertError);
            return { success: false, message: 'Could not add to wishlist.' };
        }
        resultMessage = 'Added to wishlist!';
    }
    
    // Revalidate paths to update UI
    revalidatePath('/');
    revalidatePath('/user/wishlist');
    
    return { success: true, message: resultMessage };
}
