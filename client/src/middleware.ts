import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("travel_ai_token")?.value;
  const { pathname } = request.nextUrl;

  const isAdminRoute = pathname.startsWith("/items/add") || pathname.startsWith("/items/manage");
  const isTravelerRoute = pathname.startsWith("/trip-planner") || pathname.startsWith("/my-trips");

  if (isAdminRoute || isTravelerRoute) {
    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      const base64Url = token.split(".")[1];
      if (!base64Url) {
        throw new Error("Invalid token format");
      }
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const rawPayload = atob(base64);
      const payload = JSON.parse(rawPayload);

      if (isAdminRoute && payload.role !== "admin") {
        return NextResponse.redirect(new URL("/", request.url));
      }

      if (isTravelerRoute && payload.role !== "traveler") {
        return NextResponse.redirect(new URL("/", request.url));
      }
    } catch (error) {
      console.error("Middleware token parse failed:", error);
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete("travel_ai_token");
      return response;
    }
  }

  if (token && (pathname === "/login" || pathname === "/signup")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/items/add/:path*",
    "/items/manage/:path*",
    "/trip-planner/:path*",
    "/my-trips/:path*",
    "/login",
    "/signup",
  ],
};
