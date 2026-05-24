"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, usePathname } from "next/navigation";

type AuthContextType = {
  user: any;
  loading: boolean;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: async () => {},
});

const publicRoutes = ["/", "/register", "/forgot-password", "/reset-password"];

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      setLoading(true);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!mounted) return;

      setUser(session?.user ?? null);
      setLoading(false);

      const isPublicRoute = publicRoutes.includes(pathname);

      if (!session && !isPublicRoute) {
        router.replace("/");
        return;
      }

      if (session && pathname === "/") {
        router.replace("/dashboard");
      }
    }

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;

      setUser(session?.user ?? null);
      setLoading(false);

      const isPublicRoute = publicRoutes.includes(pathname);

      if (!session && !isPublicRoute) {
        router.replace("/");
        return;
      }

      if (session && pathname === "/") {
        router.replace("/dashboard");
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [pathname, router]);

  async function logout() {
    await supabase.auth.signOut();
    setUser(null);
    router.replace("/");
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
