import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { logout } from '@/app/auth/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AdminSqlForm } from '@/components/admin-sql-form';

export default async function AdminDashboardPage() {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return redirect('/login');
  }
  
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    // This is a safeguard, middleware should have already caught this.
    return redirect('/user/home');
  }

  return (
    <div className="flex flex-col items-center justify-center py-12 gap-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Admin Dashboard</CardTitle>
          <CardDescription>Welcome, {user.email}!</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>This is a protected area for administrators only.</p>
          <p>Your user ID is: <code className="bg-muted p-1 rounded">{user.id}</code></p>
          <form action={logout}>
            <Button type="submit" className="w-full">Logout</Button>
          </form>
        </CardContent>
      </Card>

      <AdminSqlForm />
    </div>
  );
}
