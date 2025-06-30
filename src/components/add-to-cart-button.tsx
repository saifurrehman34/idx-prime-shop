"use client";

import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/use-cart';
import { useToast } from '@/hooks/use-toast';
import type { Product } from '@/types';
import { ShoppingCart, CheckCircle } from 'lucide-react';

export function AddToCartButton({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const { toast } = useToast();

  const handleAddToCart = () => {
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

  return (
    <Button onClick={handleAddToCart} size="lg">
      <ShoppingCart className="mr-2 h-5 w-5" />
      Add to Cart
    </Button>
  );
}
