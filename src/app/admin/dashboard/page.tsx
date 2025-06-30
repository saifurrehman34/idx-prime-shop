
import { createAdminClient } from '@/lib/supabase/admin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AdminSqlForm } from '@/components/admin-sql-form';
import { DollarSign, Package, ShoppingCart, Users, Clock, Mail } from 'lucide-react';
import { RevenueChart } from '@/components/revenue-chart';

export default async function AdminDashboardPage() {
  const supabase = createAdminClient();

  // Fetch stats with individual queries to be more robust
  const totalRevenuePromise = supabase
    .from('orders')
    .select('total_amount')
    .eq('status', 'delivered');

  const totalOrdersPromise = supabase
    .from('orders')
    .select('id', { count: 'exact', head: true });

  const pendingOrdersPromise = supabase
    .from('orders')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'pending');

  const totalProductsPromise = supabase
    .from('products')
    .select('id', { count: 'exact', head: true });
    
  const totalUsersPromise = supabase.auth.admin.listUsers();

  const totalSubscribersPromise = supabase
    .from('newsletter_subscribers')
    .select('id', { count: 'exact', head: true });

  const revenuePromise = supabase.rpc('get_revenue_over_time');
  
  const [
    { data: totalRevenueData, error: totalRevenueError },
    { count: totalOrders, error: totalOrdersError },
    { count: pendingOrders, error: pendingOrdersError },
    { count: totalProducts, error: totalProductsError },
    { data: usersData, error: usersError },
    { count: totalSubscribers, error: totalSubscribersError },
    { data: revenueData, error: revenueError }
  ] = await Promise.all([
    totalRevenuePromise,
    totalOrdersPromise,
    pendingOrdersPromise,
    totalProductsPromise,
    totalUsersPromise,
    totalSubscribersPromise,
    revenuePromise
  ]);
  
  if (totalRevenueError) console.error("Error fetching total revenue:", totalRevenueError);
  if (totalOrdersError) console.error("Error fetching total orders:", totalOrdersError);
  if (pendingOrdersError) console.error("Error fetching pending orders:", pendingOrdersError);
  if (totalProductsError) console.error("Error fetching total products:", totalProductsError);
  if (usersError) console.error("Error fetching total users:", usersError);
  if (totalSubscribersError) console.error("Error fetching subscribers:", totalSubscribersError);
  if (revenueError) console.error("Error fetching revenue data:", revenueError);

  const stats = {
      total_revenue: totalRevenueData?.reduce((sum, order) => sum + order.total_amount, 0) || 0,
      total_orders: totalOrders || 0,
      pending_orders: pendingOrders || 0,
      total_products: totalProducts || 0,
      total_users: usersData?.users?.length || 0,
      total_subscribers: totalSubscribers || 0,
  }

  const chartData = (revenueData || []).map(d => ({...d, total_revenue: Number(d.total_revenue)}));

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Revenue
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.total_revenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Based on delivered orders</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{stats.total_orders}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{stats.pending_orders}</div>
                 <p className="text-xs text-muted-foreground">Awaiting shipment</p>
            </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_products}</div>
            <p className="text-xs text-muted-foreground">In catalog</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_users}</div>
            <p className="text-xs text-muted-foreground">Registered accounts</p>
          </CardContent>
        </Card>
         <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Subscribers</CardTitle>
                <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">+{stats.total_subscribers}</div>
                <p className="text-xs text-muted-foreground">Newsletter signups</p>
            </CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-1 gap-4 md:gap-8 lg:grid-cols-3">
         <div className="lg:col-span-2">
            <RevenueChart data={chartData} />
         </div>
         <AdminSqlForm />
      </div>
    </>
  );
}
