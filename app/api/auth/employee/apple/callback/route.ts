import { type NextRequest, NextResponse } from "next/server";
import {
  authenticateEmployeeOAuth,
  createEmployeeSessionResponse,
  readOAuthStateCookie,
} from "../../../../../lib/auth/employee-oauth";

async function handleAppleCallback(request: NextRequest, formData?: FormData) {
  const state = readOAuthStateCookie(request);
  const returnedState = String(
    formData?.get("state") ?? request.nextUrl.searchParams.get("state") ?? "",
  );
  const code = String(
    formData?.get("code") ?? request.nextUrl.searchParams.get("code") ?? "",
  );

  if (!state || state.provider !== "apple" || !returnedState) {
    return NextResponse.json(
      { error: "Invalid Apple login state." },
      { status: 400 },
    );
  }

  if (
    returnedState !==
    Buffer.from(JSON.stringify(state), "utf8").toString("base64url")
  ) {
    return NextResponse.json(
      { error: "Apple login state mismatch." },
      { status: 400 },
    );
  }

  if (!code) {
    return NextResponse.json(
      { error: "Apple did not return an authorization code." },
      { status: 400 },
    );
  }

  try {
    const employee = await authenticateEmployeeOAuth({
      code,
      provider: "apple",
      request,
      state,
    });

    return createEmployeeSessionResponse({
      email: employee.email,
      provider: "apple",
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
            : "Unable to complete Apple employee login.",
      },
      { status: 401 },
    );
  }
}

export async function GET(request: NextRequest) {
  return handleAppleCallback(request);
}

export async function POST(request: NextRequest) {
  return handleAppleCallback(request, await request.formData());
}
