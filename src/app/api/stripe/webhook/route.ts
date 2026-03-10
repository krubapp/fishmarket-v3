import { NextResponse } from "next/server";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { adminApp } from "@/lib/firebase-admin";
import { stripe } from "@/lib/stripe";
import type Stripe from "stripe";

const db = getFirestore(adminApp);

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 },
    );
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 },
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(
          event.data.object as Stripe.Checkout.Session,
        );
        break;

      case "payment_intent.succeeded":
        await handlePaymentSucceeded(
          event.data.object as Stripe.PaymentIntent,
        );
        break;

      case "payment_intent.payment_failed":
        await handlePaymentFailed(
          event.data.object as Stripe.PaymentIntent,
        );
        break;

      case "account.updated":
        await handleAccountUpdated(event.data.object as Stripe.Account);
        break;

      default:
        break;
    }
  } catch (error) {
    console.error(`Webhook handler error for ${event.type}:`, error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 },
    );
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const meta = session.metadata || {};
  const {
    listingId,
    buyerId,
    sellerId,
    variantValueId,
    variantLabel,
    quantity: quantityStr,
    unitPrice: unitPriceStr,
    shippingCost: shippingCostStr,
  } = meta;

  if (!listingId || !buyerId || !sellerId) {
    console.error("Missing metadata on checkout session", session.id);
    return;
  }

  const quantity = parseInt(quantityStr || "1", 10);
  const unitPrice = parseFloat(unitPriceStr || "0");
  const shippingCost = parseFloat(shippingCostStr || "0");
  const totalAmount = unitPrice * quantity + shippingCost;

  // Fetch buyer info for denormalized fields
  const buyerDoc = await db.collection("users").doc(buyerId).get();
  const buyerData = buyerDoc.exists ? buyerDoc.data()! : {};

  // Fetch listing title
  const listingDoc = await db.collection("listings").doc(listingId).get();
  const listingData = listingDoc.exists ? listingDoc.data()! : {};

  // Generate sequential order number
  const ordersSnap = await db
    .collection("orders")
    .orderBy("orderNumber", "desc")
    .limit(1)
    .get();
  const lastOrderNumber = ordersSnap.empty
    ? 1000
    : (ordersSnap.docs[0].data().orderNumber as number);

  await db.collection("orders").add({
    orderNumber: lastOrderNumber + 1,
    sellerId,
    buyerId,
    buyerName:
      (buyerData.displayName as string) ||
      (buyerData.username as string) ||
      "Buyer",
    buyerEmail: (buyerData.email as string) || "",
    listingId,
    listingTitle: (listingData.title as string) || "",
    quantity,
    unitPrice,
    totalAmount,
    currency: (listingData.currency as string) || "SEK",
    status: "pending",
    stripeCheckoutSessionId: session.id,
    stripePaymentIntentId:
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent?.id || "",
    selectedVariantValueId: variantValueId || "",
    selectedVariantLabel: variantLabel || "",
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  // Deduct variant stock atomically
  if (variantValueId && listingId) {
    await deductStock(listingId, variantValueId, quantity);
  }
}

async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  const ordersSnap = await db
    .collection("orders")
    .where("stripePaymentIntentId", "==", paymentIntent.id)
    .limit(1)
    .get();

  if (ordersSnap.empty) return;

  const orderDoc = ordersSnap.docs[0];
  await orderDoc.ref.update({
    status: "confirmed",
    updatedAt: FieldValue.serverTimestamp(),
  });
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  const ordersSnap = await db
    .collection("orders")
    .where("stripePaymentIntentId", "==", paymentIntent.id)
    .limit(1)
    .get();

  if (ordersSnap.empty) return;

  const orderDoc = ordersSnap.docs[0];
  const orderData = orderDoc.data();

  await orderDoc.ref.update({
    status: "cancelled",
    updatedAt: FieldValue.serverTimestamp(),
  });

  // Restore stock
  const variantValueId = orderData.selectedVariantValueId as string;
  const listingId = orderData.listingId as string;
  const quantity = (orderData.quantity as number) || 1;

  if (variantValueId && listingId) {
    await restoreStock(listingId, variantValueId, quantity);
  }
}

async function handleAccountUpdated(account: Stripe.Account) {
  if (!account.charges_enabled || !account.details_submitted) return;

  const usersSnap = await db
    .collection("users")
    .where("stripeAccountId", "==", account.id)
    .limit(1)
    .get();

  if (usersSnap.empty) return;

  await usersSnap.docs[0].ref.update({
    stripeOnboardingComplete: true,
  });
}

async function deductStock(
  listingId: string,
  variantValueId: string,
  quantity: number,
) {
  const listingRef = db.collection("listings").doc(listingId);

  await db.runTransaction(async (tx) => {
    const snap = await tx.get(listingRef);
    if (!snap.exists) return;

    const data = snap.data()!;
    const variants = data.variants as Array<{
      id: string;
      name: string;
      values: Array<{
        id: string;
        name: string;
        price: number;
        available: number;
        imageUrl?: string;
      }>;
    }>;
    if (!variants) return;

    for (const group of variants) {
      const val = group.values.find((v) => v.id === variantValueId);
      if (val) {
        val.available = Math.max(0, val.available - quantity);
        break;
      }
    }

    tx.update(listingRef, { variants });
  });
}

async function restoreStock(
  listingId: string,
  variantValueId: string,
  quantity: number,
) {
  const listingRef = db.collection("listings").doc(listingId);

  await db.runTransaction(async (tx) => {
    const snap = await tx.get(listingRef);
    if (!snap.exists) return;

    const data = snap.data()!;
    const variants = data.variants as Array<{
      id: string;
      name: string;
      values: Array<{
        id: string;
        name: string;
        price: number;
        available: number;
        imageUrl?: string;
      }>;
    }>;
    if (!variants) return;

    for (const group of variants) {
      const val = group.values.find((v) => v.id === variantValueId);
      if (val) {
        val.available += quantity;
        break;
      }
    }

    tx.update(listingRef, { variants });
  });
}
