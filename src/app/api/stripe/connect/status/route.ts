import { NextResponse } from "next/server";
import { getFirestore } from "firebase-admin/firestore";
import { getAdminApp } from "@/lib/firebase-admin";
import { getStripe } from "@/lib/stripe";
import { verifyAuthToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const authResult = await verifyAuthToken(request);
  if (authResult instanceof NextResponse) return authResult;
  const uid = authResult.uid;

  const db = getFirestore(getAdminApp());
  const stripe = getStripe();

  try {
    const userDoc = await db.collection("users").doc(uid).get();
    if (!userDoc.exists) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 },
      );
    }

    const userData = userDoc.data()!;
    const stripeAccountId = userData.stripeAccountId as string | undefined;

    if (!stripeAccountId) {
      return NextResponse.json({
        verified: false,
        accountId: null,
      });
    }

    const account = await stripe.accounts.retrieve(stripeAccountId);
    const verified = account.charges_enabled && account.details_submitted;

    if (verified && !userData.stripeOnboardingComplete) {
      await db
        .collection("users")
        .doc(uid)
        .update({ stripeOnboardingComplete: true });
    }

    return NextResponse.json({
      verified: !!verified,
      accountId: stripeAccountId,
    });
  } catch (error) {
    console.error("Stripe Connect status error:", error);
    return NextResponse.json(
      { error: "Failed to check status" },
      { status: 500 },
    );
  }
}
