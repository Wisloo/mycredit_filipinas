import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const { pathname } = req.nextUrl;

  // Public routes — always accessible
  if (
    pathname === "/" ||
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/privacy" ||
    pathname === "/terms" ||
    pathname.startsWith("/api/auth")
  ) {
    // If already logged in, redirect away from login/signup
    if (token && (pathname === "/login" || pathname === "/signup")) {
      const payload = await verifyToken(token);
      if (payload) {
        const dest =
          payload.role === "user" ? "/dashboard" : "/admin";
        return NextResponse.redirect(new URL(dest, req.url));
      }
    }
    return NextResponse.next();
  }

  // Everything else requires auth
  if (!token) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const payload = await verifyToken(token);
  if (!payload) {
    const res = pathname.startsWith("/api/")
      ? NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      : NextResponse.redirect(new URL("/login", req.url));
    res.cookies.delete("token");
    return res;
  }

  // Role gating
  if (pathname.startsWith("/admin") && payload.role === "user") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }
  if (pathname.startsWith("/dashboard") && payload.role !== "user") {
    return NextResponse.redirect(new URL("/admin", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/login",
    "/signup",
    "/api/((?!auth).*)",
  ],
};
