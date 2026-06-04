import { NextResponse, type NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const nextPath = String(formData.get("next") ?? "/account");
  const redirectPath = nextPath.startsWith("/") && !nextPath.startsWith("//")
    ? nextPath
    : "/account";

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Enter a valid customer email." }, { status: 400 });
  }

  const response = NextResponse.redirect(new URL(redirectPath, request.url), 303);
  response.cookies.set("uns_session_role", "customer", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  });
  response.cookies.set("uns_session_email", email, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  });

  return response;
}
