import { createClient } from '@supabase/supabase-js'

// D3 promotion (spec v5.0) — anon key only, protected by RLS (CLAUDE.md Hard
// Rules). No server-side secret exists in this build.
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
)
