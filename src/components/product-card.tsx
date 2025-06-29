"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Star, ShoppingCart } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useCart } from '@/hooks/use-cart';
import type { Product } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState } from 'react';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { toast } = useToast();
  
  // Use state to prevent hydration mismatch for random values
  const [reviewsCount, setReviewsCount] = useState(0);

  useEffect(() => {
    // Generate random number only on the client side
    setReviewsCount(Math.floor(Math.random() * (1500 - 100 + 1)) + 100);
  }, []);


  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  // Mock rating as it's not in the data model. A real implementation would fetch this.
  const rating = 4;

  return (
    <Link href={`/products/${product.id}`} className="group block h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg">
      <Card className="h-full flex flex-col overflow-hidden transition-shadow duration-300 hover:shadow-xl group-focus-visible:ring-2 group-focus-visible:ring-ring">
        <div className="relative aspect-square w-full overflow-hidden">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 23vw"
            data-ai-hint={product.dataAiHint}
          />
        </div>

        <div className="p-4 flex-grow flex flex-col bg-card">
          <h3 className="font-semibold text-base leading-snug text-card-foreground group-hover:text-accent transition-colors line-clamp-2">
            {product.name}
          </h3>

          {reviewsCount > 0 && (
            <div className="flex items-center gap-1 mt-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${i < rating ? 'text-primary fill-primary' : 'text-muted-foreground/40'}`}
                  aria-hidden="true"
                />
              ))}
              <span className="text-xs text-muted-foreground ml-1">({reviewsCount})</span>
            </div>
          )}
          
          <div className="mt-2 flex-grow">
            <span className="text-2xl font-bold text-foreground">${product.price.toFixed(2)}</span>
          </div>
          
          <div className="mt-4">
            <Button onClick={handleAddToCart} size="sm" className="w-full">
              <ShoppingCart className="mr-2 h-4 w-4" />
              Add to Cart
            </Button>
          </div>
        </div>
      </Card>
    </Link>
  );
}
