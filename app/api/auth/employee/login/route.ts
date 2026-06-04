import { NextResponse, type NextRequest } from "next/server";
import type { UserRole } from "../../../../lib/auth/roles";

function roleFromEmail(email: string): Exclude<UserRole, "customer"> {
  if (email.startsWith("owner@")) return "owner";
  if (email.startsWith("manager@")) return "manager";
  if (email.startsWith("inventory@")) return "inventory";
  return "employee";
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const code = String(formData.get("code") ?? "");
  const expectedCode = process.env.EMPLOYEE_LOGIN_CODE ?? "upnsmoke";

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Enter a valid employee email." }, { status: 400 });
  }

  if (code !== expectedCode) {
    return NextResponse.json({ error: "Invalid employee sign-in code." }, { status: 401 });
  }

  const role = roleFromEmail(email);
  const nextPath = String(formData.get("next") ?? "/employee/dashboard");
  const redirectPath =
    nextPath.startsWith("/employee") && !nextPath.startsWith("//")
      ? nextPath
      : "/employee/dashboard";
  const response = NextResponse.redirect(new URL(redirectPath, request.url), 303);

  response.cookies.set("uns_session_role", role, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
  response.cookies.set("uns_session_email", email, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });

  return response;
}
