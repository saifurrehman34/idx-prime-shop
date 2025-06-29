'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { executeSql } from '@/app/admin/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Terminal, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

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

export function AdminSqlForm() {
  const [state, formAction] = useActionState(executeSql, {
    message: '',
    success: false,
  });

  return (
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
  );
}
