'use server';

import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';
import type { Database } from '@/types/database.types';

const OrderStatusSchema = z.enum(['pending', 'shipped', 'delivered', 'cancelled']);

export async function updateOrderStatus(
    orderId: string, 
    status: Database['public']['Enums']['order_status']
) {
  const validatedStatus = OrderStatusSchema.safeParse(status);

  if (!validatedStatus.success) {
    return { success: false, message: 'Invalid order status provided.' };
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from('orders')
    .update({ status: validatedStatus.data })
    .eq('id', orderId);

  if (error) {
    console.error('Error updating order status:', error);
    return { success: false, message: `Failed to update order status: ${error.message}` };
  }

  revalidatePath('/admin/orders');
  revalidatePath(`/user/orders/${orderId}`);

  return { success: true, message: `Order status updated to ${status}.` };
}
