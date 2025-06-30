'use server';

import { createClient } from '@/lib/supabase/server';
import { NextResponse, type NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const origin = requestUrl.origin;
  const next = requestUrl.searchParams.get('next') || '/';

  if (code) {
    const supabase = createClient();
    const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error && session) {
      const user = session.user;
      
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      if (!profile) {
        const { error: insertError } = await supabase
          .from('user_profiles')
          .insert({
            id: user.id,
            role: 'user',
            full_name: user.user_metadata.full_name,
            avatar_url: user.user_metadata.avatar_url,
          });
        
        if (insertError) {
          console.error("Error creating user profile:", insertError);
          return NextResponse.redirect(`${origin}/login?message=Error creating your user profile.`);
        }
      }
    } else if (error) {
        console.error("Error exchanging code for session:", error);
        return NextResponse.redirect(`${origin}/login?message=Authentication failed. Please try again.`);
    }
  }

  return NextResponse.redirect(`${origin}${next}`);
}
