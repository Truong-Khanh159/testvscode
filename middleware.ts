import { NextResponse, type NextRequest } from "next/server";

const authCookieName = "bloome_auth_token";

export function middleware(request: NextRequest) {
  const token = request.cookies.get(authCookieName)?.value;
  const { pathname } = request.nextUrl;

  if (!token && pathname.startsWith("/admin/dashboard")) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  if (!token && pathname.startsWith("/account")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/dashboard/:path*", "/account/:path*"]
};
