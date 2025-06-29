import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { logout } from '@/app/auth/actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default async function UserHomePage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/login');
  }

  return (
    <div className="flex items-center justify-center py-12">
        <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle>User Dashboard</CardTitle>
                <CardDescription>Welcome back!</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <p>Hello, {user.email}. This is your dashboard.</p>
                <p>Your user ID is: <code className="bg-muted p-1 rounded">{user.id}</code></p>
                <form action={logout}>
                    <Button type="submit" className="w-full">Logout</Button>
                </form>
            </CardContent>
        </Card>
    </div>
  );
}
