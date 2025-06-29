'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { logout } from '@/app/auth/actions';
import { executeSql } from '@/app/admin/actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Terminal, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';

function ExecuteSqlButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Executing...
        </>
      ) : (
        'Execute SQL Schema'
      )}
    </Button>
  );
}

export default function AdminDashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const [state, formAction] = useFormState(executeSql, {
    message: '',
    success: false,
  });

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
      } else {
        setUser(user);
      }
      setLoading(false);
    };
    checkUser();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-center py-12 gap-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Admin Dashboard</CardTitle>
          <CardDescription>Welcome, privileged user!</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>This is a protected area for administrators only.</p>
          <p>Your user ID is: <code className="bg-muted p-1 rounded">{user.id}</code></p>
          <form action={logout}>
            <Button type="submit" className="w-full">Logout</Button>
          </form>
        </CardContent>
      </Card>

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Database Management</CardTitle>
          <CardDescription>Execute the schema.sql file to set up or reset the database tables.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            {state.message && (
              <Alert variant={state.success ? 'default' : 'destructive'}>
                <Terminal className="h-4 w-4" />
                <AlertTitle>{state.success ? 'Success' : 'Error'}</AlertTitle>
                <AlertDescription>{state.message}</AlertDescription>
              </Alert>
            )}
            <p className="text-sm text-muted-foreground">
              Warning: This is a destructive operation that will drop existing tables and data before recreating them. Use with caution.
            </p>
            <ExecuteSqlButton />
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
