'use server';

import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import type { CartItem } from '@/types';
import { revalidatePath } from 'next/cache';

const AddressSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  postalCode: z.string().min(1, 'Postal code is required'),
  country: z.string().min(1, 'Country is required'),
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

  const validatedFields = AddressSchema.safeParse({
    fullName: formData.get('fullName'),
    address: formData.get('address'),
    city: formData.get('city'),
    state: formData.get('state'),
    postalCode: formData.get('postalCode'),
    country: formData.get('country'),
  });

  if (!validatedFields.success) {
    return {
      message: 'Invalid address information. Please check all fields.',
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }
  
  const { address, city, state, postalCode, country } = validatedFields.data;
  
  // A real app would let users select/reuse addresses. For simplicity, we create a new one.
  const { data: newAddress, error: addressError } = await supabase
    .from('addresses')
    .insert({
      user_id: user.id,
      address_line_1: address,
      city,
      state,
      postal_code: postalCode,
      country,
    })
    .select()
    .single();

  if (addressError || !newAddress) {
    console.error('Error creating address:', addressError);
    return { message: 'Could not save shipping address. Please try again.', success: false };
  }

  const totalAmount = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const { data: newOrder, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: user.id,
      total_amount: totalAmount,
      shipping_address_id: newAddress.id,
      status: 'pending',
    })
    .select()
    .single();

  if (orderError || !newOrder) {
    console.error('Error creating order:', orderError);
    return { message: 'Could not create order. Please try again.', success: false };
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
    return { message: 'Could not save order details. Please try again.', success: false };
  }
  
  revalidatePath('/user/orders');
  revalidatePath('/admin/orders');
  revalidatePath('/user/home');
  revalidatePath('/admin/dashboard');

  return { message: 'Your order has been placed successfully!', success: true };
}
