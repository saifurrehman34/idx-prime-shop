
'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function login(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const supabase = createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    let message = 'Could not authenticate user.';
    if (error.message.includes('Invalid login credentials')) {
        message = 'Invalid email or password. Please try again.';
    } else if (error.message.includes('Email not confirmed')) {
        message = 'Please check your email to confirm your account before logging in.';
    }
    console.error('Login Error:', error.message);
    return redirect(`/login?message=${encodeURIComponent(message)}`);
  }
  
  // Revalidate the root path to ensure the new session cookie is read
  revalidatePath('/', 'layout');

  // Redirect to a generic authenticated route.
  // The layout for this route will handle role-based redirection.
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
      emailRedirectTo: `${origin}/auth/callback?next=/user/home`,
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
    revalidatePath('/', 'layout');
    return redirect('/login');
}
