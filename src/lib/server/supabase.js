// src/lib/server/supabase.ts
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import { SUPABASE_SERVICE_ROLE_KEY } from '$env/static/private';
// ^ or fallback to just ANON key if you prefer

export function getServerSupabaseClient() {
	return createClient(PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
	// or if you don't want service role for dev:
	// return createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);
}
