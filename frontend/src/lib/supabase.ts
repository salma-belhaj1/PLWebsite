import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

function createMockSupabaseClient() {
  const emptyQuery = {
    select: () => emptyQuery,
    eq: () => emptyQuery,
    single: async () => ({ data: null, error: null }),
    insert: async () => ({ data: null, error: null }),
  };

  return {
    auth: {
      getSession: async () => ({ data: { session: null } }),
      onAuthStateChange: (_callback: (...args: unknown[]) => void) => ({
        data: {
          subscription: {
            unsubscribe: () => undefined,
          },
        },
      }),
      signUp: async () => ({ data: { user: null }, error: new Error('Supabase is not configured') }),
      signInWithPassword: async () => ({ error: new Error('Supabase is not configured') }),
      signOut: async () => ({ error: new Error('Supabase is not configured') }),
    },
    from: () => emptyQuery,
  } as any;
}

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createMockSupabaseClient();

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase env vars are missing, using a local mock client.');
}
