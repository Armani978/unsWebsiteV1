import { NextResponse, type NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/", request.url), 303);
  response.cookies.delete("uns_session_role");
  response.cookies.delete("uns_session_email");
  return response;
}
