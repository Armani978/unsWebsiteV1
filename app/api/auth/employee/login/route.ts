import { NextResponse, type NextRequest } from "next/server";
import {
  findSetupCode,
  isValidPersonalCode,
  normalizePhone,
  parseProfilesCookie,
} from "../../../../lib/auth/employee-phone-auth";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const phone = normalizePhone(String(formData.get("phone") ?? ""));
  const code = String(formData.get("code") ?? "");

  if (phone.length !== 10) {
    return NextResponse.json({ error: "Enter a 10-digit employee phone number." }, { status: 400 });
  }

  const nextPath = String(formData.get("next") ?? "/employee/dashboard");
  const redirectPath =
    nextPath.startsWith("/employee") && !nextPath.startsWith("//")
      ? nextPath
      : "/employee/dashboard";

  const profiles = parseProfilesCookie(request.cookies.get("uns_employee_profiles")?.value);
  const profile = profiles[phone];

  if (profile) {
    if (!isValidPersonalCode(profile, code)) {
      return NextResponse.json({ error: "Invalid employee sign-in code." }, { status: 401 });
    }

    const response = NextResponse.redirect(new URL(redirectPath, request.url), 303);

    response.cookies.set("uns_session_role", profile.role, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 12,
    });
    response.cookies.set("uns_session_email", phone, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 12,
    });
    response.cookies.set("uns_session_phone", phone, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 12,
    });

    return response;
  }

  const setupCode = findSetupCode(phone, code);

  if (!setupCode) {
    return NextResponse.json(
      { error: "Invalid setup code or personal sign-in code." },
      { status: 401 },
    );
  }

  const createCodeUrl = new URL("/employee/create-code", request.url);
  createCodeUrl.searchParams.set("next", redirectPath);
  const response = NextResponse.redirect(createCodeUrl, 303);

  response.cookies.set(
    "uns_pending_employee",
    Buffer.from(JSON.stringify({ phone, role: setupCode.role }), "utf8").toString("base64url"),
    {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 10,
    },
  );

  return response;
}
