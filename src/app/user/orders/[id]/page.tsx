import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { format } from 'date-fns';

async function getOrderDetails(orderId: string) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const { data: order, error } = await supabase
        .from('orders')
        .select(`
            id,
            created_at,
            total_amount,
            status,
            order_items (
                quantity,
                price,
                products (
                    id, name, image_url, data_ai_hint
                )
            ),
            addresses (*)
        `)
        .eq('id', orderId)
        .eq('user_id', user.id)
        .single();

    if (error || !order) {
        console.error("Error fetching order details:", error);
        notFound();
    }
    return order;
}


export default async function OrderDetailsPage({ params }: { params: { id: string }}) {
    const order = await getOrderDetails(params.id);
    const address = order.addresses;

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle>Order Details</CardTitle>
                            <CardDescription>Order ID: #{order.id.substring(0,8)}</CardDescription>
                        </div>
                        <Badge variant={order.status === 'delivered' ? 'default' : 'secondary'} className="capitalize">{order.status}</Badge>
                    </div>
                     <p className="text-sm text-muted-foreground pt-2">
                        Placed on: {format(new Date(order.created_at), "PPP")}
                    </p>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[80px] hidden md:table-cell">Image</TableHead>
                                <TableHead>Product</TableHead>
                                <TableHead className="text-center">Quantity</TableHead>
                                <TableHead className="text-right">Price</TableHead>
                                <TableHead className="text-right">Subtotal</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {/* @ts-ignore */}
                            {order.order_items.map((item) => (
                                <TableRow key={item.products.id}>
                                    <TableCell className="hidden md:table-cell">
                                        <Image 
                                            src={item.products.image_url} 
                                            alt={item.products.name}
                                            width={64}
                                            height={64}
                                            className="rounded-md object-cover"
                                            data-ai-hint={item.products.data_ai_hint}
                                        />
                                    </TableCell>
                                    <TableCell className="font-medium">{item.products.name}</TableCell>
                                    <TableCell className="text-center">{item.quantity}</TableCell>
                                    <TableCell className="text-right">${item.price.toFixed(2)}</TableCell>
                                    <TableCell className="text-right">${(item.price * item.quantity).toFixed(2)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    <div className="mt-4 text-right font-bold text-lg">
                        Total: ${order.total_amount.toFixed(2)}
                    </div>
                </CardContent>
            </Card>

            {address && (
                <Card>
                    <CardHeader>
                        <CardTitle>Shipping Address</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <address className="not-italic text-muted-foreground">
                            {address.address_line_1}<br />
                            {address.address_line_2 && <>{address.address_line_2}<br /></>}
                            {address.city}, {address.state} {address.postal_code}<br />
                            {address.country}
                        </address>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
