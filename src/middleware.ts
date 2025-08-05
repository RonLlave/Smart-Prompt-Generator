import { NextResponse } from "next/server"

export function middleware() {
  // No auth checks in middleware - handle in pages
  // This avoids Edge runtime issues and database lookups
  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}