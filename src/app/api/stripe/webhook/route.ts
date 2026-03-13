import { NextResponse } from "next/server";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getAdminApp } from "@/lib/firebase-admin";
import { getStripe } from "@/lib/stripe";
import type Stripe from "stripe";

export const dynamic = "force-dynamic";

function getDb() {
  return getFirestore(getAdminApp());
}

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 },
    );
  }

  const stripe = getStripe();
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

      case "payment_intent.canceled":
        await handlePaymentCanceled(
          event.data.object as Stripe.PaymentIntent,
        );
        break;

      case "charge.refunded":
        await handleChargeRefunded(event.data.object as Stripe.Charge);
        break;

      case "charge.dispute.created":
        await handleDisputeCreated(
          event.data.object as Stripe.Dispute,
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

  const db = getDb();

  // Idempotency: skip if an order for this session already exists
  const existingOrder = await db
    .collection("orders")
    .where("stripeCheckoutSessionId", "==", session.id)
    .limit(1)
    .get();
  if (!existingOrder.empty) return;

  const quantity = parseInt(quantityStr || "1", 10);
  const unitPrice = parseFloat(unitPriceStr || "0");
  const shippingCost = parseFloat(shippingCostStr || "0");
  const totalAmount = unitPrice * quantity + shippingCost;
  const buyerDoc = await db.collection("users").doc(buyerId).get();
  const buyerData = buyerDoc.exists ? buyerDoc.data()! : {};

  // Fetch listing title
  const listingDoc = await db.collection("listings").doc(listingId).get();
  const listingData = listingDoc.exists ? listingDoc.data()! : {};

  // Atomic order number via counter document
  const counterRef = db.collection("counters").doc("orders");
  const orderNumber = await db.runTransaction(async (tx) => {
    const counterSnap = await tx.get(counterRef);
    const current = counterSnap.exists
      ? (counterSnap.data()!.lastOrderNumber as number)
      : 1000;
    const next = current + 1;
    tx.set(counterRef, { lastOrderNumber: next }, { merge: true });
    return next;
  });

  const orderRef = await db.collection("orders").add({
    orderNumber,
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

  // Deduct variant stock atomically — if insufficient, cancel the order
  if (variantValueId && listingId) {
    const deducted = await deductStock(listingId, variantValueId, quantity);
    if (!deducted) {
      await orderRef.update({
        status: "cancelled",
        updatedAt: FieldValue.serverTimestamp(),
      });
      console.error(
        `Insufficient stock for variant ${variantValueId} on listing ${listingId}, order cancelled`,
      );
    }
  }
}

async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  const db = getDb();
  const ordersSnap = await db
    .collection("orders")
    .where("stripePaymentIntentId", "==", paymentIntent.id)
    .limit(1)
    .get();

  if (ordersSnap.empty) return;

  const orderDoc = ordersSnap.docs[0];
  const orderData = orderDoc.data();

  // Idempotency: only transition from pending
  if (orderData.status !== "pending") return;

  await orderDoc.ref.update({
    status: "confirmed",
    updatedAt: FieldValue.serverTimestamp(),
  });
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  const db = getDb();
  const ordersSnap = await db
    .collection("orders")
    .where("stripePaymentIntentId", "==", paymentIntent.id)
    .limit(1)
    .get();

  if (ordersSnap.empty) return;

  const orderDoc = ordersSnap.docs[0];
  const orderData = orderDoc.data();

  // Idempotency: only cancel if not already cancelled
  if (orderData.status === "cancelled") return;

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

async function handlePaymentCanceled(paymentIntent: Stripe.PaymentIntent) {
  const db = getDb();
  const ordersSnap = await db
    .collection("orders")
    .where("stripePaymentIntentId", "==", paymentIntent.id)
    .limit(1)
    .get();

  if (ordersSnap.empty) return;

  const orderDoc = ordersSnap.docs[0];
  const orderData = orderDoc.data();

  if (orderData.status === "cancelled") return;

  await orderDoc.ref.update({
    status: "cancelled",
    updatedAt: FieldValue.serverTimestamp(),
  });

  const variantValueId = orderData.selectedVariantValueId as string;
  const listingId = orderData.listingId as string;
  const quantity = (orderData.quantity as number) || 1;

  if (variantValueId && listingId) {
    await restoreStock(listingId, variantValueId, quantity);
  }
}

async function handleChargeRefunded(charge: Stripe.Charge) {
  const paymentIntentId =
    typeof charge.payment_intent === "string"
      ? charge.payment_intent
      : charge.payment_intent?.id;

  if (!paymentIntentId) return;

  const db = getDb();
  const ordersSnap = await db
    .collection("orders")
    .where("stripePaymentIntentId", "==", paymentIntentId)
    .limit(1)
    .get();

  if (ordersSnap.empty) return;

  const orderDoc = ordersSnap.docs[0];
  const orderData = orderDoc.data();

  if (orderData.status === "returned") return;

  await orderDoc.ref.update({
    status: "returned",
    updatedAt: FieldValue.serverTimestamp(),
  });

  const variantValueId = orderData.selectedVariantValueId as string;
  const listingId = orderData.listingId as string;
  const quantity = (orderData.quantity as number) || 1;

  if (variantValueId && listingId) {
    await restoreStock(listingId, variantValueId, quantity);
  }
}

async function handleDisputeCreated(dispute: Stripe.Dispute) {
  const paymentIntentId =
    typeof dispute.payment_intent === "string"
      ? dispute.payment_intent
      : dispute.payment_intent?.id;

  if (!paymentIntentId) return;

  const db = getDb();
  const ordersSnap = await db
    .collection("orders")
    .where("stripePaymentIntentId", "==", paymentIntentId)
    .limit(1)
    .get();

  if (ordersSnap.empty) return;

  await ordersSnap.docs[0].ref.update({
    status: "return_requested",
    updatedAt: FieldValue.serverTimestamp(),
  });
}

async function handleAccountUpdated(account: Stripe.Account) {
  const db = getDb();
  const usersSnap = await db
    .collection("users")
    .where("stripeAccountId", "==", account.id)
    .limit(1)
    .get();

  if (usersSnap.empty) return;

  const verified = account.charges_enabled && account.details_submitted;
  await usersSnap.docs[0].ref.update({
    stripeOnboardingComplete: !!verified,
  });
}

/** Returns true if stock was successfully deducted, false if insufficient. */
async function deductStock(
  listingId: string,
  variantValueId: string,
  quantity: number,
): Promise<boolean> {
  const db = getDb();
  const listingRef = db.collection("listings").doc(listingId);

  return db.runTransaction(async (tx) => {
    const snap = await tx.get(listingRef);
    if (!snap.exists) return false;

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
    if (!variants) return false;

    for (const group of variants) {
      const val = group.values.find((v) => v.id === variantValueId);
      if (val) {
        if (val.available < quantity) return false;
        val.available -= quantity;
        tx.update(listingRef, { variants });
        return true;
      }
    }
    return false;
  });
}

async function restoreStock(
  listingId: string,
  variantValueId: string,
  quantity: number,
) {
  const db = getDb();
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
