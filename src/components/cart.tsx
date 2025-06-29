"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/hooks/use-cart';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, ShoppingCart } from 'lucide-react';
import { Input } from './ui/input';
import { SheetClose } from '@/components/ui/sheet';

export function Cart() {
  const { cartItems, removeFromCart, updateQuantity, cartTotal, cartCount } = useCart();

  return (
    <div className="flex h-full flex-col">
      {cartCount > 0 ? (
        <>
          <ScrollArea className="flex-1 pr-4 -mr-4">
            <div className="flex flex-col gap-4 py-4">
              {cartItems.map(item => (
                <div key={item.product.id} className="flex items-center gap-4">
                  <div className="relative h-16 w-16 overflow-hidden rounded-md">
                    <Image
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                      data-ai-hint={item.product.dataAiHint}
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{item.product.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                        <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateQuantity(item.product.id, parseInt(e.target.value) || 0)}
                            className="h-8 w-16"
                            aria-label={`${item.product.name} quantity`}
                        />
                        <span className="text-sm text-muted-foreground">x ${item.product.price.toFixed(2)}</span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFromCart(item.product.id)}
                    className="text-muted-foreground hover:text-destructive"
                    aria-label={`Remove ${item.product.name} from cart`}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
          <div className="mt-auto border-t pt-4">
            <div className="flex justify-between font-semibold text-lg">
              <p>Total</p>
              <p>${cartTotal.toFixed(2)}</p>
            </div>
            <SheetClose asChild>
                <Button asChild className="w-full mt-4">
                    <Link href="/user/checkout">Checkout</Link>
                </Button>
            </SheetClose>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center h-full text-center">
            <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold">Your cart is empty</h3>
            <p className="text-muted-foreground mt-2">Add some fresh products to get started.</p>
            <SheetClose asChild>
              <Button asChild className="mt-4">
                <Link href="/">Start Shopping</Link>
              </Button>
            </SheetClose>
        </div>
      )}
    </div>
  );
}
