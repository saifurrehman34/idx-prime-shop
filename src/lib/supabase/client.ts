import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/database.types';

export const createClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required!');
  }

  return createBrowserClient<Database>(
    supabaseUrl,
    supabaseKey
  );
};
