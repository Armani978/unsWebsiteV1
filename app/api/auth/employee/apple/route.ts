import { type NextRequest, NextResponse } from "next/server";
import {
  buildEmployeeOAuthUrl,
  createOAuthState,
  sanitizeEmployeeNextPath,
  setOAuthStateCookie,
} from "../../../../lib/auth/employee-oauth";

export async function GET(request: NextRequest) {
  const nextPath = sanitizeEmployeeNextPath(
    request.nextUrl.searchParams.get("next"),
  );
  const state = createOAuthState("apple", nextPath);
  const authorization = buildEmployeeOAuthUrl(request, "apple", state);

  if (!authorization.configured) {
    return NextResponse.json(
      {
        error: "Apple employee login is not configured.",
        missing: authorization.missing,
      },
      { status: 503 },
    );
  }

  const response = NextResponse.redirect(authorization.url);
  setOAuthStateCookie(response, state);
  return response;
}
