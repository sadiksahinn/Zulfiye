import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(_req: NextRequest) {
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
