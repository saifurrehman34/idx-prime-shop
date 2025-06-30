'use client';

import { useCart } from '@/hooks/use-cart';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { placeOrder } from '@/app/user/checkout/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Loader2, Plus, CreditCard, Truck } from 'lucide-react';
import Image from 'next/image';
import type { CartItem, Address } from '@/types';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AddressForm } from '@/components/address-form';
import { createClient } from '@/lib/supabase/client';
import { Separator } from './ui/separator';

function PlaceOrderButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending || disabled}>
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Place Order'}
    </Button>
  );
}

export function CheckoutForm({ initialAddresses }: { initialAddresses: Address[] }) {
  const { cartItems, cartTotal, clearCart } = useCart();
  const router = useRouter();
  const { toast } = useToast();
  const [addresses, setAddresses] = useState(initialAddresses);
  const [selectedAddressId, setSelectedAddressId] = useState<string | undefined>(
    initialAddresses.find(a => a.is_default)?.id || initialAddresses[0]?.id
  );
  const [paymentMethod, setPaymentMethod] = useState<string>('cod');
  const [isAddressFormOpen, setIsAddressFormOpen] = useState(false);

  const initialState = { message: '', success: false, errors: {} };
  const placeOrderWithCart = placeOrder.bind(null, cartItems);
  const [state, formAction] = useFormState(placeOrderWithCart, initialState);
  
  useEffect(() => {
    if (cartItems.length === 0 && !state.success) {
      toast({ title: 'Your cart is empty', description: 'Please add items to your cart before checking out.', variant: 'destructive' });
      router.push('/');
    }
  }, [cartItems, router, toast, state.success]);

  useEffect(() => {
    if (state.success) {
      toast({ title: 'Order Placed!', description: state.message });
      clearCart();
      router.push('/user/orders');
    } else if (state.message && !state.success) {
      toast({ title: 'Error', description: state.message, variant: 'destructive' });
    }
  }, [state, router, toast, clearCart]);

  const handleAddressFormSuccess = async () => {
    setIsAddressFormOpen(false);
    const supabase = createClient();
    const { data } = await supabase.from('addresses').select('*').order('created_at', { ascending: false });
    setAddresses(data || []);
    if (data && data.length > 0) {
      setSelectedAddressId(data[0].id);
    }
  };


  if (cartItems.length === 0) {
    return (
        <div className="flex items-center justify-center py-12">
            <Card className="mx-auto max-w-sm text-center">
                <CardHeader>
                    <CardTitle>Cart is Empty</CardTitle>
                    <CardDescription>Redirecting you to the homepage...</CardDescription>
                </CardHeader>
                <CardContent>
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                </CardContent>
            </Card>
        </div>
    );
  }

  return (
    <form action={formAction} className="grid md:grid-cols-2 gap-8">
      <div>
        <Card>
          <CardHeader>
            <CardTitle>Shipping &amp; Payment</CardTitle>
            <CardDescription>Select your shipping address and payment method.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <input type="hidden" name="addressId" value={selectedAddressId} />
            <input type="hidden" name="paymentMethod" value={paymentMethod} />
            
            <div>
                <Label className="text-base font-semibold mb-4 block">Shipping Address</Label>
                <RadioGroup
                    value={selectedAddressId}
                    onValueChange={setSelectedAddressId}
                    className="space-y-4"
                >
                    {addresses.map(address => (
                    <Label key={address.id} htmlFor={address.id} className="flex items-start gap-4 border rounded-md p-4 cursor-pointer hover:bg-muted/50 has-[:checked]:bg-muted has-[:checked]:border-primary">
                        <RadioGroupItem value={address.id} id={address.id} />
                        <div className="text-sm">
                        <p className="font-semibold">{address.address_line_1}</p>
                        <address className="not-italic text-muted-foreground">
                            {address.address_line_2 &amp;&amp; &lt;&gt;{address.address_line_2}&lt;br /&gt;&lt;&gt;}
                            {address.city}, {address.state} {address.postal_code}&lt;br /&gt;
                            {address.country}
                        </address>
                        </div>
                    </Label>
                    ))}
                </RadioGroup>
            
                <Dialog open={isAddressFormOpen} onOpenChange={setIsAddressFormOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" className="w-full mt-4">
                            <Plus className="mr-2 h-4 w-4" /> Add New Address
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Address</DialogTitle>
                        </DialogHeader>
                        <AddressForm onSuccess={handleAddressFormSuccess} />
                    </DialogContent>
                </Dialog>
            </div>
            
            <Separator />
            
            <div>
                <Label className="text-base font-semibold mb-4 block">Payment Method</Label>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-4">
                    <Label htmlFor="payment_cod" className="flex items-center gap-4 border rounded-md p-4 cursor-pointer hover:bg-muted/50 has-[:checked]:bg-muted has-[:checked]:border-primary">
                        <RadioGroupItem value="cod" id="payment_cod" />
                        <Truck className="h-5 w-5 text-muted-foreground" />
                        <span className="font-medium">Cash on Delivery</span>
                    </Label>
                    <Label htmlFor="payment_card" className="flex items-center gap-4 border rounded-md p-4 cursor-pointer hover:bg-muted/50 has-[:checked]:bg-muted has-[:checked]:border-primary has-[:disabled]:opacity-50 has-[:disabled]:cursor-not-allowed">
                        <RadioGroupItem value="card" id="payment_card" disabled />
                        <CreditCard className="h-5 w-5 text-muted-foreground" />
                        <span className="font-medium">Credit/Debit Card</span>
                        <span className="ml-auto text-xs text-muted-foreground">(Coming Soon)</span>
                    </Label>
                </RadioGroup>
            </div>
          </CardContent>
        </Card>
      </div>
      <div>
        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
            <CardDescription>{cartItems.length} items</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
              {cartItems.map(item => (
                <div key={item.product.id} className="flex justify-between items-center">
                   <div className="flex items-center gap-3">
                    <Image src={item.product.imageUrl} alt={item.product.name} width={48} height={48} className="rounded-md object-cover" data-ai-hint={item.product.dataAiHint}/>
                    <div className="text-sm">
                        <p className="font-medium line-clamp-1">{item.product.name}</p>
                        <p className="text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <span className="font-medium">${(item.product.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="border-t pt-4 flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>${cartTotal.toFixed(2)}</span>
            </div>
          </CardContent>
          <CardFooter>
            <PlaceOrderButton disabled={!selectedAddressId} />
          </CardFooter>
        </Card>
      </div>
    </form>
  );
}
