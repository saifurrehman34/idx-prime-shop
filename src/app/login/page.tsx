'use client';

import Link from 'next/link';
import { useFormStatus } from 'react-dom';
import { login } from '@/app/auth/actions';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

function LoginButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {pending ? 'Logging in...' : 'Login'}
    </Button>
  );
}

export default function LoginPage({
  searchParams,
}: {
  searchParams: { message: string };
}) {
  const isSuccessMessage = searchParams.message?.includes('Check your email');
  const isErrorMessage = !isSuccessMessage && searchParams.message;

  return (
    <div className="flex items-center justify-center py-12">
      <Card className="mx-auto max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={login} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                name="email"
                placeholder="m@example.com"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" name="password" required />
            </div>
            {isSuccessMessage && (
              <p className="p-4 bg-green-100 text-green-800 text-center rounded-md text-sm">
                {searchParams.message}
              </p>
            )}
            {isErrorMessage && (
               <p className="p-4 bg-red-100 text-red-800 text-center rounded-md text-sm">
                {searchParams.message}
              </p>
            )}
            <LoginButton />
          </form>
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="underline">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
