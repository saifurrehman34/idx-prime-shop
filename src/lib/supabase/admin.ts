import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

// NOTE: This client is meant for server-side administrative tasks only.
// It uses the Supabase service role key and should never be exposed to the client.
// Ensure that `SUPABASE_SERVICE_ROLE_KEY` is set in your .env file.

export const createAdminClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required for admin client!');
  }

  return createClient<Database>(
    supabaseUrl,
    serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
};
