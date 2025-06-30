
import { createAdminClient } from '@/lib/supabase/admin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AdminSqlForm } from '@/components/admin-sql-form';
import { DollarSign, Package, ShoppingCart, Users, Clock, Mail } from 'lucide-react';
import { RevenueChart } from '@/components/revenue-chart';

export default async function AdminDashboardPage() {
  const supabase = createAdminClient();
  const statsPromise = supabase.rpc('get_admin_stats').single();
  const revenuePromise = supabase.rpc('get_revenue_over_time');
  
  const [{ data: stats, error: statsError }, { data: revenueData, error: revenueError }] = await Promise.all([statsPromise, revenuePromise]);
  
  if (statsError) {
    console.error("Error fetching admin stats:", statsError);
  }
  if (revenueError) {
    console.error("Error fetching revenue data:", revenueError);
  }

  // @ts-ignore
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
            <div className="text-2xl font-bold">${stats?.total_revenue?.toFixed(2) ?? '0.00'}</div>
            <p className="text-xs text-muted-foreground">Based on delivered orders</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{stats?.total_orders ?? 0}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{stats?.pending_orders ?? 0}</div>
                 <p className="text-xs text-muted-foreground">Awaiting shipment</p>
            </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_products ?? 0}</div>
            <p className="text-xs text-muted-foreground">In catalog</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_users ?? 0}</div>
            <p className="text-xs text-muted-foreground">Registered accounts</p>
          </CardContent>
        </Card>
         <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Subscribers</CardTitle>
                <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">+{stats?.total_subscribers ?? 0}</div>
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
