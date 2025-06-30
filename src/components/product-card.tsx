"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Star, ShoppingCart, Heart, Eye, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useCart } from '@/hooks/use-cart';
import type { Product } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState, useTransition } from 'react';
import { Badge } from './ui/badge';
import { toggleWishlist } from '@/app/user/wishlist/actions';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  isFavorited: boolean;
}

export function ProductCard({ product, isFavorited: initialIsFavorited }: ProductCardProps) {
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const [isFavorited, setIsFavorited] = useState(initialIsFavorited);
  const [reviewsCount, setReviewsCount] = useState(0);
  const [discount, setDiscount] = useState(0);

  useEffect(() => {
    // These will only run on the client, after initial hydration
    setReviewsCount(Math.floor(Math.random() * (1500 - 100 + 1)) + 100);
    setDiscount(Math.floor(Math.random() * 30) + 10);
  }, []);

  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    toast({
      variant: "success",
      title: (
        <div className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5" />
          <span>Added to cart</span>
        </div>
      ),
      description: `${product.name} has been added to your cart.`,
    });
  };

  const handleFavoriteToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    startTransition(async () => {
      const originalState = isFavorited;
      setIsFavorited(!originalState);
      const result = await toggleWishlist(product.id);
      if (result.success) {
        toast({ title: result.message });
      } else {
        setIsFavorited(originalState);
        toast({ title: "Error", description: result.message, variant: "destructive" });
      }
    });
  };

  const rating = 4.5;
  
  return (
    <Card className="h-full flex flex-col overflow-hidden border-none shadow-none bg-transparent">
      <div className="relative aspect-square w-full overflow-hidden bg-secondary rounded-md group">
        <Link href={`/products/${product.id}`} className="block h-full w-full">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-110"
            sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 23vw"
            data-ai-hint={product.dataAiHint}
          />
        </Link>
        {discount > 0 && (
            <div className="absolute top-3 left-3">
                <Badge variant="destructive">-{discount}%</Badge>
            </div>
        )}
        <div className="absolute top-3 right-3 flex flex-col gap-2">
            <Button onClick={handleFavoriteToggle} variant="secondary" size="icon" className="h-8 w-8 rounded-full" disabled={isPending}>
                <Heart className={cn("h-4 w-4 transition-colors", isFavorited && 'fill-destructive text-destructive')} />
                <span className="sr-only">Toggle Wishlist</span>
            </Button>
             <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full" asChild>
                <Link href={`/products/${product.id}`}>
                    <Eye className="h-4 w-4"/>
                </Link>
            </Button>
        </div>
        <Button onClick={handleAddToCart} className="absolute bottom-0 w-full rounded-t-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <ShoppingCart className="mr-2 h-4 w-4" />
          Add to Cart
        </Button>
      </div>

      <CardContent className="p-0 pt-4 flex-grow flex flex-col">
        <h3 className="font-medium text-base leading-snug text-foreground line-clamp-2">
          {product.name}
        </h3>
        
        <div className="mt-2 flex-grow">
          <span className="text-base font-medium text-primary">${product.price.toFixed(2)}</span>
          {discount > 0 && (
            <span className="text-base text-muted-foreground line-through ml-3">${(product.price * (1 + discount / 100)).toFixed(2)}</span>
          )}
        </div>
        
        {reviewsCount > 0 && (
          <div className="flex items-center gap-1 mt-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground/40'}`}
                aria-hidden="true"
              />
            ))}
            <span className="text-xs text-muted-foreground ml-1">({reviewsCount})</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
