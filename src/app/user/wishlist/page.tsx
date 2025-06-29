import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProductCard } from '@/components/product-card';
import type { Product } from '@/types';

const parseImageUrl = (url: string | null): string => {
    if (!url) return 'https://placehold.co/600x400.png';
    try {
        const urls = JSON.parse(url);
        return Array.isArray(urls) && urls.length > 0 ? urls[0] : url;
    } catch {
        return url;
    }
};

async function getWishlistItems() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const { data, error } = await supabase
        .from('wishlists')
        .select(`
            products (
                *,
                categories (name)
            )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
    
    if (error) {
        console.error("Error fetching wishlist:", error);
        return [];
    }
    
    const products: Product[] = data
        .map(item => item.products)
        .filter((p): p is NonNullable<typeof p> => p !== null)
        .map(p => ({ ...p, imageUrl: parseImageUrl(p.image_url), longDescription: p.long_description, dataAiHint: p.data_ai_hint }));
    
    return products;
}


export default async function WishlistPage() {
    const wishlistItems = await getWishlistItems();

    return (
        <Card>
            <CardHeader>
                <CardTitle>My Wishlist</CardTitle>
                <CardDescription>
                Your saved items for future purchases.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {wishlistItems.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        {wishlistItems.map((product) => (
                            <ProductCard key={product.id} product={product} isFavorited={true} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-muted-foreground py-8">
                        <p>Your wishlist is empty. Start adding products you love!</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
