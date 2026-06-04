import { NextResponse } from "next/server";

type CloverWebhookPayload = {
  appId?: string;
  merchants?: Record<
    string,
    Array<{
      objectId?: string;
      ts?: number;
      type?: string;
    }>
  >;
  verificationCode?: string;
};

export async function POST(request: Request) {
  const payload = (await request.json()) as CloverWebhookPayload;

  if (payload.verificationCode) {
    console.info("[clover-webhook] verification requested", {
      verificationCode: payload.verificationCode,
    });

    return NextResponse.json({ ok: true });
  }

  const updates = Object.values(payload.merchants ?? {}).flat();

  console.info("[clover-webhook] notification received", {
    appId: payload.appId ?? null,
    updateCount: updates.length,
    updateTypes: Array.from(
      new Set(updates.map((update) => update.type).filter(Boolean)),
    ),
  });

  return NextResponse.json({ ok: true });
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    message: "UNSV Clover webhook receiver is ready.",
  });
}
