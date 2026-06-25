import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/", request.url), 303);
  response.cookies.delete("uns_session_role");
  response.cookies.delete("uns_session_email");
  response.cookies.delete("uns_session_auth_provider");
  response.cookies.delete("uns_session_phone");
  response.cookies.delete("uns_employee_profiles");
  response.cookies.delete("uns_pending_employee");
  response.cookies.delete("uns_employee_oauth_state");
  return response;
}
