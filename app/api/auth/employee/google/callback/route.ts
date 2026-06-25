import { type NextRequest, NextResponse } from "next/server";
import {
  authenticateEmployeeOAuth,
  createEmployeeSessionResponse,
  readOAuthStateCookie,
} from "../../../../../lib/auth/employee-oauth";

export async function GET(request: NextRequest) {
  const state = readOAuthStateCookie(request);
  const returnedState = request.nextUrl.searchParams.get("state");
  const code = request.nextUrl.searchParams.get("code");

  if (!state || state.provider !== "google" || !returnedState) {
    return NextResponse.json(
      { error: "Invalid Google login state." },
      { status: 400 },
    );
  }

  if (
    returnedState !==
    Buffer.from(JSON.stringify(state), "utf8").toString("base64url")
  ) {
    return NextResponse.json(
      { error: "Google login state mismatch." },
      { status: 400 },
    );
  }

  if (!code) {
    return NextResponse.json(
      { error: "Google did not return an authorization code." },
      { status: 400 },
    );
  }

  try {
    const employee = await authenticateEmployeeOAuth({
      code,
      provider: "google",
      request,
      state,
    });

    return createEmployeeSessionResponse({
      email: employee.email,
      provider: "google",
      request,
      role: employee.role,
      redirectPath: state.next,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to complete Google employee login.",
      },
      { status: 401 },
    );
  }
}
