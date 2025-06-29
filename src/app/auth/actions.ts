'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';

export async function login(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const supabase = createClient();

  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError) {
    let message = 'Could not authenticate user.';
    if (signInError.message.includes('Invalid login credentials')) {
        message = 'Invalid email or password. Please try again.';
    }
    return redirect(`/login?message=${encodeURIComponent(message)}`);
  }
  
  if (!signInData.user) {
    return redirect(`/login?message=${encodeURIComponent('Could not authenticate user. No user data found.')}`);
  }

  // After successful login, get user profile to determine role
  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', signInData.user.id)
    .single();

  if (profileError || !profile) {
    // Even if login is successful, if we can't get the profile, something is wrong.
    // Log them out and send to login with an error message.
    await supabase.auth.signOut();
    return redirect(`/login?message=${encodeURIComponent('Could not retrieve user profile. Please try again.')}`);
  }

  // Redirect based on role
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
