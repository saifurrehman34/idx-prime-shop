'use client';

import { useState, useTransition } from 'react';
import Image from 'next/image';
import { useCart } from '@/hooks/use-cart';
import { useToast } from '@/hooks/use-toast';
import type { Product, ReviewWithAuthor } from '@/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Star, Heart, Minus, Plus, ShieldCheck, Truck, RotateCw } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toggleWishlist } from '@/app/user/wishlist/actions';
import { ProductReviews } from './product-reviews';

interface ProductDetailsViewProps {
  product: Product;
  imageUrls: string[];
  reviews: ReviewWithAuthor[];
  hasPurchased: boolean;
  isUserLoggedIn: boolean;
}

export function ProductDetailsView({ product, imageUrls, reviews, hasPurchased, isUserLoggedIn }: ProductDetailsViewProps) {
  const [mainImage, setMainImage] = useState(imageUrls[0]);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [isFavorited, setIsFavorited] = useState(false); // This should be passed as a prop in a real app

  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0 ? reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews : 0;
  
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
    <>
      <div className="grid md:grid-cols-2 gap-8 lg:gap-16">
        {/* Image Gallery */}
        <div className="flex flex-col-reverse md:flex-row gap-4">
          <div className="flex md:flex-col gap-2 justify-center">
            {imageUrls.map((url, index) => (
              <button
                key={index}
                onClick={() => setMainImage(url)}
                className={cn(
                  'relative aspect-square w-16 h-16 overflow-hidden rounded-md transition-all',
                  mainImage === url ? 'ring-2 ring-primary ring-offset-2' : 'hover:opacity-80'
                )}
              >
                <Image src={url} alt={`${product.name} thumbnail ${index + 1}`} fill className="object-cover" data-ai-hint={product.dataAiHint} />
              </button>
            ))}
          </div>
          <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-secondary">
            <Image
              src={mainImage}
              alt={product.name}
              fill
              className="object-contain p-4"
              data-ai-hint={product.dataAiHint}
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </div>

        {/* Product Information */}
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold mb-2">{product.name}</h1>
          <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`w-5 h-5 ${i < Math.round(averageRating) ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground/40'}`} />
                  ))}
              </div>
              <a href="#reviews" className="text-sm text-muted-foreground hover:underline">({totalReviews} Reviews)</a>
              <Separator orientation="vertical" className="h-4" />
              <span className="text-sm text-green-600 font-medium">In Stock</span>
          </div>
          <p className="text-3xl font-bold mb-6">${product.price.toFixed(2)}</p>
          <ul className="text-muted-foreground mb-6 leading-relaxed list-disc list-inside space-y-1">
            {product.description.split('.').filter(s => s.trim()).map((sentence, index) => (
                <li key={index}>{sentence.trim()}</li>
            ))}
          </ul>

          <Separator className="my-6" />
          
          <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-2 border rounded-md p-1">
                  <Button variant="ghost" size="icon" onClick={() => setQuantity(q => Math.max(1, q - 1))}>
                      <Minus className="h-4 w-4" />
                  </Button>
                  <span className="font-bold text-lg w-10 text-center">{quantity}</span>
                  <Button variant="ghost" size="icon" onClick={() => setQuantity(q => q + 1)}>
                      <Plus className="h-4 w-4" />
                  </Button>
              </div>
              <div className="flex-1">
                  <Button size="lg" className="w-full h-12" onClick={handleAddToCart}>
                      Add to Cart
                  </Button>
              </div>
              <Button onClick={handleFavoriteToggle} variant="outline" size="icon" className="h-12 w-12" disabled={isPending}>
                  <Heart className={cn("h-6 w-6", isFavorited && 'fill-destructive text-destructive')} />
                  <span className="sr-only">Toggle Wishlist</span>
              </Button>
          </div>

          <div className="border rounded-md divide-y">
            <div className="p-4 flex items-center gap-4">
                <Truck className="h-8 w-8 text-primary" />
                <div>
                    <p className="font-semibold">Free Delivery</p>
                    <p className="text-sm text-muted-foreground">Enter your postal code for Delivery Availability</p>
                </div>
            </div>
             <div className="p-4 flex items-center gap-4">
                <RotateCw className="h-8 w-8 text-primary" />
                <div>
                    <p className="font-semibold">Return Delivery</p>
                    <p className="text-sm text-muted-foreground">Free 30 Days Delivery Returns. Details</p>
                </div>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-16" id="reviews">
        <Tabs defaultValue="description">
            <TabsList className="mb-6">
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="reviews">Reviews ({totalReviews})</TabsTrigger>
            </TabsList>
            <TabsContent value="description">
                <div className="prose max-w-none text-muted-foreground">
                    <p>{product.longDescription}</p>
                </div>
            </TabsContent>
            <TabsContent value="reviews">
                <ProductReviews 
                    productId={product.id} 
                    reviews={reviews} 
                    isUserLoggedIn={isUserLoggedIn}
                    hasPurchased={hasPurchased}
                    />
            </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
