'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';

export async function login(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const supabase = createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return redirect(`/login?message=Could not authenticate user: ${error.message}`);
  }

  // After successful login, get the user to check their role
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    // This should not happen, but as a safeguard
    return redirect('/login?message=Login successful, but could not retrieve user data.');
  }

  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  // If the profile doesn't exist or there was an error fetching it,
  // sign out and redirect to login with an error message.
  // This is a safeguard against incomplete signups or database issues.
  if (profileError || !profile) {
    await supabase.auth.signOut();
    return redirect('/login?message=Your user profile could not be found. Please contact support.');
  }

  if (profile.role === 'admin') {
    return redirect('/admin/dashboard');
  }

  return redirect('/user/home');
}

export async function signup(formData: FormData) {
  const origin = headers().get('origin');
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const supabase = createClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    console.error('Signup Error:', error);
    // Passing the raw error message to help with debugging during development.
    return redirect(`/signup?message=Could not create user: ${error.message}`);
  }

  return redirect('/login?message=Check your email to confirm your account');
}

export async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    return redirect('/login');
}
