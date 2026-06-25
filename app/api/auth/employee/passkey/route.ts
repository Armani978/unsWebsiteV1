import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      error:
        "Employee passkey login needs credential storage before it can be enabled. Use Google or Apple login for now.",
    },
    { status: 501 },
  );
}
