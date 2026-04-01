import { jwtVerify } from "jose";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const studentCookie = "g7_student_session";
const adminCookie = "g7_admin_session";

function getSecret(): Uint8Array {
  const s = process.env.SESSION_SECRET;
  if (!s) return new Uint8Array();
  return new TextEncoder().encode(s);
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const secret = getSecret();

  if (path.startsWith("/student")) {
    if (secret.length === 0) return NextResponse.next();
    const token = request.cookies.get(studentCookie)?.value;
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    try {
      const { payload } = await jwtVerify(token, secret);
      if (payload.role !== "student") throw new Error("role");
    } catch {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  if (path.startsWith("/admin") && path !== "/admin/login") {
    if (secret.length === 0) return NextResponse.next();
    const token = request.cookies.get(adminCookie)?.value;
    if (!token) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    try {
      const { payload } = await jwtVerify(token, secret);
      if (payload.role !== "admin") throw new Error("role");
    } catch {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/student/:path*", "/admin", "/admin/:path*"],
};
