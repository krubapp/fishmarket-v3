import { NextResponse } from "next/server";
import { getFirestore } from "firebase-admin/firestore";
import { getAdminApp } from "@/lib/firebase-admin";
import { getStripe } from "@/lib/stripe";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const db = getFirestore(getAdminApp());
  const stripe = getStripe();
  try {
    const { listingId, buyerId, variantValueId, quantity = 1 } = await request.json();

    if (!listingId || !buyerId) {
      return NextResponse.json(
        { error: "listingId and buyerId are required" },
        { status: 400 },
      );
    }

    // Fetch listing
    const listingDoc = await db.collection("listings").doc(listingId).get();
    if (!listingDoc.exists) {
      return NextResponse.json(
        { error: "Listing not found" },
        { status: 404 },
      );
    }
    const listing = listingDoc.data()!;

    // Fetch seller
    const sellerId = listing.sellerId as string;
    if (!sellerId) {
      return NextResponse.json(
        { error: "Listing has no seller" },
        { status: 400 },
      );
    }

    const sellerDoc = await db.collection("users").doc(sellerId).get();
    if (!sellerDoc.exists) {
      return NextResponse.json(
        { error: "Seller not found" },
        { status: 404 },
      );
    }
    const sellerData = sellerDoc.data()!;

    if (!sellerData.stripeAccountId || !sellerData.stripeOnboardingComplete) {
      return NextResponse.json(
        { error: "Seller has not completed payment setup" },
        { status: 400 },
      );
    }

    // Resolve price from variant or base listing
    let unitPrice = listing.price as number;
    let variantLabel = "";
    if (variantValueId && listing.variants) {
      const groups = listing.variants as Array<{
        id: string;
        name: string;
        values: Array<{
          id: string;
          name: string;
          price: number;
          available: number;
        }>;
      }>;
      let found = false;
      for (const group of groups) {
        const val = group.values.find(
          (v: { id: string }) => v.id === variantValueId,
        );
        if (val) {
          if (val.available < quantity) {
            return NextResponse.json(
              { error: "Not enough stock available" },
              { status: 400 },
            );
          }
          if (val.price > 0) unitPrice = val.price;
          variantLabel = `${group.name}: ${val.name}`;
          found = true;
          break;
        }
      }
      if (!found) {
        return NextResponse.json(
          { error: "Variant not found" },
          { status: 400 },
        );
      }
    }

    // Ensure buyer has a Stripe customer ID
    const buyerDoc = await db.collection("users").doc(buyerId).get();
    const buyerData = buyerDoc.exists ? buyerDoc.data()! : {};
    let stripeCustomerId = buyerData.stripeCustomerId as string | undefined;

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: buyerData.email || undefined,
        metadata: { firebaseUid: buyerId },
      });
      stripeCustomerId = customer.id;
      await db.collection("users").doc(buyerId).update({ stripeCustomerId });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const shippingCost = (listing.shippingCost as number) || 0;

    const lineItems: Array<{
      price_data: {
        currency: string;
        product_data: { name: string; description?: string };
        unit_amount: number;
      };
      quantity: number;
    }> = [
      {
        price_data: {
          currency: ((listing.currency as string) || "SEK").toLowerCase(),
          product_data: {
            name: listing.title as string,
            ...(variantLabel ? { description: variantLabel } : {}),
          },
          unit_amount: Math.round(unitPrice * 100),
        },
        quantity,
      },
    ];

    if (shippingCost > 0) {
      lineItems.push({
        price_data: {
          currency: ((listing.currency as string) || "SEK").toLowerCase(),
          product_data: { name: "Shipping" },
          unit_amount: Math.round(shippingCost * 100),
        },
        quantity: 1,
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer: stripeCustomerId,
      line_items: lineItems,
      payment_intent_data: {
        transfer_data: {
          destination: sellerData.stripeAccountId as string,
        },
      },
      metadata: {
        listingId,
        buyerId,
        sellerId,
        variantValueId: variantValueId || "",
        variantLabel: variantLabel || "",
        quantity: String(quantity),
        unitPrice: String(unitPrice),
        shippingCost: String(shippingCost),
      },
      success_url: `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/listings/${listingId}`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 },
    );
  }
}
