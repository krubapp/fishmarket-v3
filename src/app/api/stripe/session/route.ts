import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { verifyAuthToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const authResult = await verifyAuthToken(request);
  if (authResult instanceof NextResponse) return authResult;

  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("session_id");

  if (!sessionId) {
    return NextResponse.json(
      { error: "session_id is required" },
      { status: 400 },
    );
  }

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items"],
    });

    if (session.status !== "complete") {
      return NextResponse.json(
        { error: "Session is not complete" },
        { status: 400 },
      );
    }

    const meta = session.metadata || {};
    const lineItem = session.line_items?.data?.[0];

    return NextResponse.json({
      valid: true,
      productName: lineItem?.description || meta.variantLabel || "Item",
      amount: session.amount_total ? session.amount_total / 100 : 0,
      currency: (session.currency || "sek").toUpperCase(),
      quantity: parseInt(meta.quantity || "1", 10),
    });
  } catch {
    return NextResponse.json(
      { error: "Invalid session" },
      { status: 400 },
    );
  }
}
