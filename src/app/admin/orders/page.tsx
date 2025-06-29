import { createAdminClient } from '@/lib/supabase/admin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from './data-table';
import { columns, type Order } from './columns';

async function getOrders(): Promise<Order[]> {
    const supabase = createAdminClient();
    const { data, error } = await supabase
        .from('orders')
        .select(`
            id,
            created_at,
            total_amount,
            status,
            user_profiles (
                full_name,
                email
            )
        `)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching orders:', error);
        return [];
    }

    return data as Order[];
}

export default async function AdminOrdersPage() {
    const orders = await getOrders();

    return (
        <Card>
            <CardHeader>
                <CardTitle>Orders</CardTitle>
                <CardDescription>Manage all customer orders.</CardDescription>
            </CardHeader>
            <CardContent>
                <DataTable columns={columns} data={orders} />
            </CardContent>
        </Card>
    );
}
