import { NextResponse, type NextRequest } from "next/server";

const employeeRoles = new Set(["owner", "manager", "inventory", "employee"]);
const customerOnlyPaths = [
  "/account",
  "/orders",
  "/favorites",
  "/pickup",
  "/reviews",
  "/checkout",
  "/store/checkout",
];

function isCustomerOnlyPath(pathname: string) {
  return customerOnlyPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const role = request.cookies.get("uns_session_role")?.value;

  if (pathname.startsWith("/employee") && pathname !== "/employee/login") {
    if (!role || !employeeRoles.has(role)) {
      const loginUrl = new URL("/employee/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  if (isCustomerOnlyPath(pathname) && role !== "customer") {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/employee/:path*",
    "/account/:path*",
    "/orders/:path*",
    "/favorites/:path*",
    "/pickup/:path*",
    "/reviews/:path*",
    "/checkout/:path*",
    "/store/checkout/:path*",
  ],
};
