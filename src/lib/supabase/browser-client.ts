import { createBrowserClient } from '@supabase/ssr';
import { supabasePublishableDefaultKey, supabaseUrl } from './config';

export function createSupabaseBrowserClient() {
  return createBrowserClient(supabaseUrl, supabasePublishableDefaultKey);
}
