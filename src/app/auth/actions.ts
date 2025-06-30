
'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';

export async function login(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const supabase = createClient();

  // Step 1: Sign in
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError) {
    let message = 'Could not authenticate user.';
    if (signInError.message.includes('Invalid login credentials')) {
        message = 'Invalid email or password. Please try again.';
    } else if (signInError.message.includes('Email not confirmed')) {
        message = 'Please check your email to confirm your account before logging in.';
    }
    return redirect(`/login?message=${encodeURIComponent(message)}`);
  }
  
  const user = signInData.user;
  if (!user) {
    return redirect(`/login?message=${encodeURIComponent('Could not authenticate user. No user data found.')}`);
  }

  // Step 2: Get user profile, or create it if it's missing.
  let { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profileError && profileError.code === 'PGRST116') {
    // Profile doesn't exist, create it.
    const { data: newProfile, error: insertError } = await supabase
      .from('user_profiles')
      .insert({ id: user.id, role: 'user' }) // Default role is 'user'
      .select('role')
      .single();
    
    if (insertError) {
      // If profile creation fails, we can't proceed.
      await supabase.auth.signOut();
      return redirect(`/login?message=${encodeURIComponent(`A critical error occurred: Could not create user profile.`)}`);
    }
    profile = newProfile;
  } else if (profileError) {
    // Any other profile error is also critical.
    await supabase.auth.signOut();
    return redirect(`/login?message=${encodeURIComponent(`A critical error occurred: Could not retrieve user profile.`)}`);
  }

  if (!profile) {
    // This should theoretically not be reached, but it's a good safeguard.
    await supabase.auth.signOut();
    return redirect(`/login?message=${encodeURIComponent('Could not retrieve or create user profile.')}`);
  }

  // Step 3: Redirect based on role
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
    return redirect('/login');
}
