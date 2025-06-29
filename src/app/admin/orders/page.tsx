import { createAdminClient } from '@/lib/supabase/admin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from './data-table';
import { columns, type Order } from './columns';

async function getOrders(): Promise<Order[]> {
    const supabase = createAdminClient();

    // Fetch all necessary data in parallel for efficiency
    const ordersPromise = supabase
        .from('orders')
        .select(`id, created_at, total_amount, status, user_id`)
        .order('created_at', { ascending: false });

    const profilesPromise = supabase.from('user_profiles').select('id, full_name');
    
    const authUsersPromise = supabase.auth.admin.listUsers();

    const [
        { data: ordersData, error: ordersError },
        { data: profilesData, error: profilesError },
        { data: authUsersData, error: authUsersError }
    ] = await Promise.all([ordersPromise, profilesPromise, authUsersPromise]);

    if (ordersError) {
        console.error('Error fetching orders:', ordersError);
        return [];
    }
    if (profilesError) console.error('Error fetching profiles:', profilesError);
    if (authUsersError) console.error('Error fetching auth users:', authUsersError);
    
    // Create maps for efficient lookups
    const profilesMap = new Map(profilesData?.map(p => [p.id, p.full_name]));
    const authUsersMap = new Map(authUsersData?.users.map(u => [u.id, u.email]));
    
    // Combine the data into the shape the table component expects
    const combinedData = ordersData.map(order => {
        return {
            ...order,
            user_profiles: {
                full_name: profilesMap.get(order.user_id) || 'N/A',
                email: authUsersMap.get(order.user_id) || 'N/A'
            }
        };
    });

    return combinedData as unknown as Order[];
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
