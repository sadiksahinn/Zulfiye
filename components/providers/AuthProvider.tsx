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
  user: null, profile: null, role: "staff", loading: true, logout: async () => {},
});

const publicRoutes = ["/", "/register", "/forgot-password", "/reset-password", "/auth/confirm"];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [role, setRole] = useState<"staff" | "admin" | "super_admin">("staff");
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  async function loadProfile(userId: string) {
    const { data } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
    setProfile(data || null);
    setRole((data?.role as any) || "staff");
  }

  useEffect(() => {
    let mounted = true;
    const timeout = setTimeout(() => { if (mounted) setLoading(false); }, 3000);

    async function loadUser() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!mounted) return;
        setUser(session?.user ?? null);
        if (session?.user?.id) await loadProfile(session.user.id);
        else { setProfile(null); setRole("staff"); }
        const isPublicRoute = publicRoutes.includes(pathname);
        if (!session && !isPublicRoute) { router.replace("/"); }
        else if (session && pathname === "/") { router.replace("/today"); }
      } catch (e) {
        console.error("Auth error:", e);
      } finally {
        if (mounted) { setLoading(false); clearTimeout(timeout); }
      }
    }

    loadUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      setUser(session?.user ?? null);
      if (session?.user?.id) await loadProfile(session.user.id);
      else { setProfile(null); setRole("staff"); }
      if (mounted) { setLoading(false); clearTimeout(timeout); }
      const isPublicRoute = publicRoutes.includes(pathname);
      if (!session && !isPublicRoute) router.replace("/");
      else if (session && (pathname === "/" || event === "SIGNED_IN")) router.replace("/today");
    });

    return () => { mounted = false; clearTimeout(timeout); subscription.unsubscribe(); };
  }, [pathname, router]);

  async function logout() {
    await supabase.auth.signOut();
    setUser(null); setProfile(null); setRole("staff");
    router.replace("/");
  }

  return (
    <AuthContext.Provider value={{ user, profile, role, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() { return useContext(AuthContext); }
