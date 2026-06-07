import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  "https://eamefwpmtwuoiozdymmb.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVhbWVmd3BtdHd1b2lvemR5bW1iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA2NDY3NDEsImV4cCI6MjA5NjIyMjc0MX0.y0BuAMwuhqzUoQTO9Pp_ZI0HbHe1hjV-SnMfAmFN8pk",
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: "zulfiye-canbolat-auth",
    },
  }
);
