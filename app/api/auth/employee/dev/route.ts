import { type NextRequest, NextResponse } from "next/server";
import {
  createEmployeeSessionResponse,
  getEmployeeDevLoginEmail,
  isEmployeeDevLoginEnabled,
  sanitizeEmployeeNextPath,
} from "../../../../lib/auth/employee-oauth";

export async function POST(request: NextRequest) {
  if (!isEmployeeDevLoginEnabled()) {
    return NextResponse.json(
      { error: "Dev employee login is disabled." },
      { status: 404 },
    );
  }

  const formData = await request.formData();
  const nextPath = sanitizeEmployeeNextPath(
    typeof formData.get("next") === "string"
      ? formData.get("next")?.toString()
      : request.nextUrl.searchParams.get("next"),
  );

  return createEmployeeSessionResponse({
    email: getEmployeeDevLoginEmail(),
    provider: "dev",
    request,
    role: "owner",
    redirectPath: nextPath,
  });
}
