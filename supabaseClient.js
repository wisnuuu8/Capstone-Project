import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
import { env } from 'config.js';

export const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_KEY);