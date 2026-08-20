import { createClient } from "@supabase/supabase-js";

// Browser-safe client. Uses the anon key, respects Row Level Security.
// Use this in client components (e.g. reading a batch for the provenance page).
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // Thrown at import time so a missing .env.local fails loudly instead of
  // silently returning empty data. See .env.example.
  console.warn(
    "[supabase] NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY are not set. " +
      "Copy .env.example to .env.local and fill in your Supabase project values."
  );
}

// Falls back to a syntactically-valid placeholder URL when env vars are
// missing, so createClient() never throws at module-import time -- that
// throw would otherwise crash `next build` and any server route that
// merely imports this file (e.g. api/batches/route.ts, for getServiceSupabase
// below), even if it never touches this anon client. Real requests still
// fail loudly once actually attempted against the placeholder.
export const supabase = createClient(
  supabaseUrl || "https://placeholder.invalid",
  supabaseAnonKey || "placeholder-anon-key"
);

// Server-only client. Uses the service role key, bypasses Row Level Security.
// Only import this inside src/app/api/** route handlers -- never in a
// client component, since the service role key must never reach the browser.
export function getServiceSupabase() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    throw new Error(
      "[supabase] SUPABASE_SERVICE_ROLE_KEY / NEXT_PUBLIC_SUPABASE_URL missing. " +
        "Set them in .env.local (see .env.example)."
    );
  }
  return createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });
}
