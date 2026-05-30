"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, usePathname } from "next/navigation";

type AuthContextType = {
  user: any;
  profile: any;
  role: "staff" | "admin" | "super_admin";
  loading: boolean;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  role: "staff",
  loading: true,
  logout: async () => {},
});

const publicRoutes = ["/", "/register", "/forgot-password", "/reset-password"];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [role, setRole] = useState<"staff" | "admin" | "super_admin">("staff");
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const pathname = usePathname();

  async function loadProfile(userId: string) {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();
    setProfile(data || null);
    setRole((data?.role as any) || "staff");
  }

  useEffect(() => {
    let mounted = true;

    // Maksimum 4 saniye loading — sonra zorla bitir
    const timeout = setTimeout(() => {
      if (mounted && loading) {
        setLoading(false);
      }
    }, 4000);

    async function loadUser() {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!mounted) return;

      setUser(session?.user ?? null);
      if (session?.user?.id) {
        await loadProfile(session.user.id);
      } else {
        setProfile(null);
        setRole("staff");
      }

      setLoading(false);
      clearTimeout(timeout);

      const isPublicRoute = publicRoutes.includes(pathname);
      if (!session && !isPublicRoute) { router.replace("/"); return; }
      if (session && pathname === "/") { router.replace("/today"); }
    }

    loadUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;
      setUser(session?.user ?? null);
      if (session?.user?.id) {
        await loadProfile(session.user.id);
      } else {
        setProfile(null);
        setRole("staff");
      }
      setLoading(false);
      clearTimeout(timeout);

      const isPublicRoute = publicRoutes.includes(pathname);
      if (!session && !isPublicRoute) { router.replace("/"); return; }
      if (session && pathname === "/") { router.replace("/today"); }
    });

    return () => {
      mounted = false;
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, [pathname, router]);

  async function logout() {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setRole("staff");
    router.replace("/");
  }

  return (
    <AuthContext.Provider value={{ user, profile, role, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
