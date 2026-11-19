const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabasePublishableDefaultKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

if (!supabaseUrl) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL');
}

if (!supabasePublishableDefaultKey) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY');
}

export { supabaseUrl, supabasePublishableDefaultKey };
