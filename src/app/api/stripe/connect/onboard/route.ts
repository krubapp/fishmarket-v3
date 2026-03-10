import { NextResponse } from "next/server";
import { getFirestore } from "firebase-admin/firestore";
import { adminApp } from "@/lib/firebase-admin";
import { stripe } from "@/lib/stripe";

const db = getFirestore(adminApp);

export async function POST(request: Request) {
  try {
    const { uid } = await request.json();

    if (!uid) {
      return NextResponse.json(
        { error: "uid is required" },
        { status: 400 },
      );
    }

    const userDoc = await db.collection("users").doc(uid).get();
    if (!userDoc.exists) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 },
      );
    }

    const userData = userDoc.data()!;
    let stripeAccountId = userData.stripeAccountId as string | undefined;

    if (!stripeAccountId) {
      const account = await stripe.accounts.create({
        type: "express",
        email: userData.email,
        metadata: { firebaseUid: uid },
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
      });
      stripeAccountId = account.id;
      await db.collection("users").doc(uid).update({ stripeAccountId });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const accountLink = await stripe.accountLinks.create({
      account: stripeAccountId,
      refresh_url: `${appUrl}/stripe/connect/return?refresh=true`,
      return_url: `${appUrl}/stripe/connect/return`,
      type: "account_onboarding",
    });

    return NextResponse.json({ url: accountLink.url });
  } catch (error) {
    console.error("Stripe Connect onboard error:", error);
    return NextResponse.json(
      { error: "Failed to create onboarding link" },
      { status: 500 },
    );
  }
}
