import { NextResponse } from "next/server";
import {
  exchangeCloverAuthorizationCode,
  getCloverOAuthConfig,
} from "../../../lib/clover";
import { saveCloverConnection } from "../../../lib/clover-token-store";

export async function GET(request: Request) {
  const oauth = getCloverOAuthConfig();
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const merchantId = url.searchParams.get("merchant_id");

  if (!oauth.configured) {
    return NextResponse.json(
      {
        error: "Clover OAuth is not configured on the server.",
        missing: oauth.missing,
      },
      { status: 503 },
    );
  }

  if (!code || !merchantId) {
    return NextResponse.json(
      { error: "Clover did not return an authorization code and merchant ID." },
      { status: 400 },
    );
  }

  try {
    const token = await exchangeCloverAuthorizationCode(oauth.config, code);
    await saveCloverConnection(merchantId, oauth.config.environment, token);

    return NextResponse.redirect(
      new URL("/employee/settings?clover=connected", oauth.config.appUrl),
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to save Clover authorization.",
      },
      { status: 502 },
    );
  }
}
