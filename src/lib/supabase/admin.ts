import { createClient as supabaseAdminClient } from "@supabase/supabase-js";

export const supabaseAdmin = supabaseAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  {
    auth: {
      persistSession: false,
    },
  }
);
