import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://nhuppitzevuncgmwggg.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_W5gVcVXA5JCJl6dApDIh2w_EbTbB-Kz';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);