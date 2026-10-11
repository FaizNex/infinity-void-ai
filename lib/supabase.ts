import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://nhuppitzevuncgmwggg.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_W5gVcVXA5JCJl6dApDIh2w_EbTbB-Kz';

// Always pass valid non-empty string URLs
export const supabase = createClient(
  SUPABASE_URL.startsWith('http') ? SUPABASE_URL : 'https://nhuppitzevuncgmwggg.supabase.co',
  SUPABASE_ANON_KEY || 'dummy-key'
);