import { NextResponse, type NextRequest } from "next/server";
import type { UserRole } from "../../../../lib/auth/roles";
import {
  createEmployeeProfile,
  normalizePhone,
  parseProfilesCookie,
  serializeProfilesCookie,
} from "../../../../lib/auth/employee-phone-auth";

function parsePendingEmployee(value: string | undefined) {
  if (!value) {
    return null;
  }

  try {
    const pending = JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as {
      phone?: string;
      role?: Exclude<UserRole, "customer">;
    };

    if (!pending.phone || !pending.role) {
      return null;
    }

    return {
      phone: normalizePhone(pending.phone),
      role: pending.role,
    };
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  const pending = parsePendingEmployee(request.cookies.get("uns_pending_employee")?.value);

  if (!pending) {
    return NextResponse.json({ error: "Employee setup session expired." }, { status: 401 });
  }

  const formData = await request.formData();
  const code = String(formData.get("code") ?? "").trim();
  const confirmCode = String(formData.get("confirmCode") ?? "").trim();
  const nextPath = String(formData.get("next") ?? "/employee/dashboard");
  const redirectPath =
    nextPath.startsWith("/employee") && !nextPath.startsWith("//")
      ? nextPath
      : "/employee/dashboard";

  if (!/^\d{4,8}$/.test(code)) {
    return NextResponse.json(
      { error: "Create a numeric sign-in code with 4 to 8 digits." },
      { status: 400 },
    );
  }

  if (code !== confirmCode) {
    return NextResponse.json({ error: "Sign-in codes do not match." }, { status: 400 });
  }

  const profiles = parseProfilesCookie(request.cookies.get("uns_employee_profiles")?.value);
  profiles[pending.phone] = createEmployeeProfile({
    phone: pending.phone,
    role: pending.role,
    code,
  });

  const response = NextResponse.redirect(new URL(redirectPath, request.url), 303);

  response.cookies.set("uns_employee_profiles", serializeProfilesCookie(profiles), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  response.cookies.set("uns_session_role", pending.role, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
  response.cookies.set("uns_session_email", pending.phone, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
  response.cookies.set("uns_session_phone", pending.phone, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
  response.cookies.delete("uns_pending_employee");

  return response;
}
