import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Placeholder: activer plus tard pour protéger /dashboard via Supabase
export function middleware(req: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
