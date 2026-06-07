import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://eamefwpmtwuoiozdymmb.supabase.co";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVhbWVmd3BtdHd1b2lvemR5bW1iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA2NDY3NDEsImV4cCI6MjA5NjIyMjc0MX0.y0BuAMwuhqzUoQTO9Pp_ZI0HbHe1hjV-SnMfAmFN8pk";

export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: "zülfiye-canbolat-auth",
    },
  }
);
