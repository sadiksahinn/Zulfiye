"use client";


import React, { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  BarChart3,
  CalendarDays,
  CreditCard,
  Home,
  LogOut,
  MessageSquareText,
  Package,
  RotateCcw,
  Settings,
  ShoppingBag,
  UserRound,
  Users,
} from "lucide-react";


export default function AppShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, role, loading, logout } = useAuth();


  const operationMenu = [
    { name: "Bugün", href: "/today", icon: Home },
    { name: "Takvim", href: "/calendar", icon: CalendarDays },
    { name: "Kiralama", href: "/rentals", icon: CalendarDays },
    { name: "Provalar", href: "/fittings", icon: UserRound },
    { name: "Satış", href: "/sales", icon: ShoppingBag },
    { name: "Müşteriler", href: "/customers", icon: Users },
    { name: "Ürünler", href: "/products", icon: Package },
    { name: "İade / Teslim", href: "/returns", icon: RotateCcw },
  ];


  const managementMenu = [
    { name: "Yönetim", href: "/dashboard", icon: BarChart3 },
    { name: "Muhasebe", href: "/accounting", icon: CreditCard },
    { name: "Raporlar", href: "/reports", icon: BarChart3 },
    { name: "SMS", href: "/sms", icon: MessageSquareText },
    { name: "Personel", href: "/staff", icon: UserRound },
    { name: "Ayarlar", href: "/settings", icon: Settings },
  ];


  const userEmail =
    typeof user === "object" && user && "email" in user
      ? String(user.email)
      : "Kullanıcı";


  const adminOnlyRoutes = ["/accounting", "/reports", "/staff", "/settings"];


  useEffect(() => {
    if (loading) return;


    if (role === "staff" && adminOnlyRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`))) {
      router.replace("/today");
    }
  }, [pathname, role, router, loading]);

