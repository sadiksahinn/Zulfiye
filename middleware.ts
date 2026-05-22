import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicRoutes = ["/", "/forgot-password", "/reset-password"];

export function middleware(req: NextRequest) {
  const token =
    req.cookies.get("sb-access-token") ||
    req.cookies.get("supabase-auth-token");

  const { pathname } = req.nextUrl;

  const isPublic = publicRoutes.includes(pathname);

  if (!token && !isPublic) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (token && pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/products/:path*",
    "/customers/:path*",
    "/rentals/:path*",
    "/sales/:path*",
    "/returns/:path*",
    "/calendar/:path*",
    "/reports/:path*",
    "/accounting/:path*",
    "/staff/:path*",
    "/settings/:path*",
    "/sms/:path*",
  ],
};
