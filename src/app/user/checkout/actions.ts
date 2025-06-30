'use server';

import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import type { CartItem } from '@/types';
import { revalidatePath } from 'next/cache';

const CheckoutSchema = z.object({
  addressId: z.string().uuid('A shipping address is required.'),
  paymentMethod: z.enum(['cod', 'card'], { required_error: 'A payment method is required.' }),
});

type FormState = {
  message: string;
  success: boolean;
  errors?: Record<string, string[] | undefined>;
};

export async function placeOrder(
  cartItems: CartItem[],
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return {
      message: 'You must be logged in to place an order.',
      success: false,
    };
  }

  if (cartItems.length === 0) {
     return {
      message: 'Your cart is empty.',
      success: false,
    };
  }

  const validatedFields = CheckoutSchema.safeParse({
    addressId: formData.get('addressId'),
    paymentMethod: formData.get('paymentMethod'),
  });

  if (!validatedFields.success) {
    return {
      message: 'Please complete all required fields.',
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }
  
  const { addressId, paymentMethod } = validatedFields.data;
  
  // Verify the address belongs to the user
  const { data: address, error: addressError } = await supabase
    .from('addresses')
    .select('id')
    .eq('id', addressId)
    .eq('user_id', user.id)
    .single();

  if (addressError || !address) {
    console.error('Address verification failed:', addressError);
    return { message: 'Invalid shipping address selected.', success: false };
  }

  const totalAmount = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const { data: newOrder, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: user.id,
      total_amount: totalAmount,
      shipping_address_id: addressId,
      status: 'pending',
      payment_method: paymentMethod,
    })
    .select()
    .single();

  if (orderError || !newOrder) {
    console.error('Error creating order:', orderError);
    return { message: `Could not create order. Please try again. DB Error: ${orderError?.message}`, success: false };
  }

  const orderItems = cartItems.map(item => ({
    order_id: newOrder.id,
    product_id: item.product.id,
    quantity: item.quantity,
    price: item.product.price,
  }));

  const { error: orderItemsError } = await supabase.from('order_items').insert(orderItems);

  if (orderItemsError) {
    console.error('Error creating order items:', orderItemsError);
    // Potentially roll back the order creation here in a real app
    return { message: 'Could not save order details. Please try again.', success: false };
  }
  
  revalidatePath('/user/orders');
  revalidatePath('/admin/orders');
  revalidatePath('/user/home');
  revalidatePath('/admin/dashboard');

  return { message: 'Your order has been placed successfully!', success: true };
}
