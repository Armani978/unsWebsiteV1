import { NextResponse } from "next/server";
import {
  buildCloverAuthorizeUrl,
  getCloverOAuthConfig,
} from "../../../lib/clover";

export async function GET() {
  const oauth = getCloverOAuthConfig();

  if (!oauth.configured) {
    return NextResponse.json(
      {
        error: "Clover OAuth is not configured.",
        missing: oauth.missing,
      },
      { status: 503 },
    );
  }

  return NextResponse.redirect(buildCloverAuthorizeUrl(oauth.config));
}
