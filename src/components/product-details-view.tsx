
'use client';

import { useState, useEffect, useTransition } from 'react';
import Image from 'next/image';
import { useCart } from '@/hooks/use-cart';
import { useToast } from '@/hooks/use-toast';
import type { Product } from '@/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Star, Heart, Minus, Plus } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { toggleWishlist } from '@/app/user/wishlist/actions';

interface ProductDetailsViewProps {
  product: Product;
  imageUrls: string[];
}

export function ProductDetailsView({ product, imageUrls }: ProductDetailsViewProps) {
  const [mainImage, setMainImage] = useState(imageUrls[0]);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  // This part would typically come from DB/user auth, faking for now
  const [isFavorited, setIsFavorited] = useState(false);
  const [reviewsCount, setReviewsCount] = useState(0);
  const rating = 4.5;
  
  useEffect(() => {
    // Random values for display purposes
    setReviewsCount(Math.floor(Math.random() * 250) + 20);
  }, []);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    toast({
      title: 'Added to Cart',
      description: `${quantity} x ${product.name} has been added to your cart.`,
    });
  };
  
  const handleFavoriteToggle = () => {
    startTransition(async () => {
      const originalState = isFavorited;
      setIsFavorited(!originalState);
      const result = await toggleWishlist(product.id);
      if (result.success) {
        toast({ title: result.message });
      } else {
        setIsFavorited(originalState);
        toast({ title: 'Error', description: result.message, variant: 'destructive' });
      }
    });
  };

  return (
    <div className="grid md:grid-cols-2 gap-8 lg:gap-16">
      {/* Image Gallery */}
      <div className="flex flex-col gap-4">
        <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-secondary">
          <Image
            src={mainImage}
            alt={product.name}
            fill
            className="object-contain"
            data-ai-hint={product.dataAiHint}
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
        <div className="grid grid-cols-4 gap-4">
          {imageUrls.map((url, index) => (
            <button
              key={index}
              onClick={() => setMainImage(url)}
              className={cn(
                'relative aspect-square w-full overflow-hidden rounded-md transition-all',
                mainImage === url ? 'ring-2 ring-primary ring-offset-2' : 'hover:opacity-80'
              )}
            >
              <Image src={url} alt={`${product.name} thumbnail ${index + 1}`} fill className="object-cover" data-ai-hint={product.dataAiHint} />
            </button>
          ))}
        </div>
      </div>

      {/* Product Information */}
      <div>
        <h1 className="text-3xl lg:text-4xl font-bold mb-2">{product.name}</h1>
        <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`w-5 h-5 ${i < Math.floor(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground/40'}`} />
                ))}
            </div>
            <span className="text-sm text-muted-foreground">({reviewsCount} Reviews)</span>
            <Separator orientation="vertical" className="h-4" />
            <span className="text-sm text-green-600 font-medium">In Stock</span>
        </div>
        <p className="text-3xl font-bold mb-6">${product.price.toFixed(2)}</p>
        <p className="text-muted-foreground mb-6 leading-relaxed">{product.longDescription}</p>

        <Separator className="my-8" />
        
        <div className="flex items-center gap-8">
            <div className="flex items-center gap-4 border rounded-md p-2">
                <Button variant="ghost" size="icon" onClick={() => setQuantity(q => Math.max(1, q - 1))}>
                    <Minus className="h-4 w-4" />
                </Button>
                <span className="font-bold text-lg w-8 text-center">{quantity}</span>
                <Button variant="ghost" size="icon" onClick={() => setQuantity(q => q + 1)}>
                    <Plus className="h-4 w-4" />
                </Button>
            </div>
            <div className="flex-1">
                <Button size="lg" className="w-full" onClick={handleAddToCart}>
                    Add to Cart
                </Button>
            </div>
             <Button onClick={handleFavoriteToggle} variant="outline" size="icon" className="h-12 w-12" disabled={isPending}>
                <Heart className={cn("h-6 w-6", isFavorited && 'fill-destructive text-destructive')} />
                <span className="sr-only">Toggle Wishlist</span>
            </Button>
        </div>
      </div>
    </div>
  );
}
