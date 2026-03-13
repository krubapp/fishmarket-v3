import { NextResponse } from "next/server";
import { getFirestore } from "firebase-admin/firestore";
import { getAdminApp } from "@/lib/firebase-admin";
import { getStripe } from "@/lib/stripe";
import { verifyAuthToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const authResult = await verifyAuthToken(request);
  if (authResult instanceof NextResponse) return authResult;
  const authenticatedUid = authResult.uid;

  const db = getFirestore(getAdminApp());
  const stripe = getStripe();

  try {
    const body = await request.json();
    const {
      listingId,
      buyerId,
      variantValueId,
      quantity = 1,
      cart: isCartCheckout,
      sellerId: cartSellerId,
    } = body;

    if (!buyerId || buyerId !== authenticatedUid) {
      return NextResponse.json(
        buyerId ? { error: "buyerId does not match authenticated user" } : { error: "buyerId is required" },
        { status: buyerId ? 403 : 400 },
      );
    }

    // --- Cart checkout: multiple items for one seller ---
    if (isCartCheckout && cartSellerId) {
      const cartDoc = await db.collection("user_carts").doc(buyerId).get();
      const cartData = cartDoc.exists ? cartDoc.data() : null;
      const items = (cartData?.items ?? []) as Array<{ listingId: string; quantity: number; variantValueId?: string }>;
      if (items.length === 0) {
        return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
      }

      const listingsByKey = new Map<string, { listingId: string; quantity: number; variantValueId?: string }>();
      for (const it of items) {
        const key = `${it.listingId}:${it.variantValueId ?? ""}`;
        const existing = listingsByKey.get(key);
        if (existing) existing.quantity += it.quantity;
        else listingsByKey.set(key, { ...it });
      }
      const uniqueItems = Array.from(listingsByKey.values());

      const pendingItems: Array<{
        listingId: string;
        quantity: number;
        variantValueId?: string;
        sellerId: string;
        unitPrice: number;
        shippingCost: number;
        variantLabel: string;
        listingTitle: string;
        currency: string;
      }> = [];
      const lineItems: Array<{
        price_data: { currency: string; product_data: { name: string; description?: string }; unit_amount: number };
        quantity: number;
      }> = [];
      let totalShipping = 0;
      const currency = "sek";

      for (const it of uniqueItems) {
        const listingDoc = await db.collection("listings").doc(it.listingId).get();
        if (!listingDoc.exists) continue;
        const listing = listingDoc.data()!;
        const listingSellerId = listing.sellerId as string | undefined;
        if (!listingSellerId || listingSellerId !== cartSellerId) continue;

        const sellerDoc = await db.collection("users").doc(listingSellerId).get();
        if (!sellerDoc.exists) continue;
        const sellerData = sellerDoc.data()!;
        if (!sellerData.stripeAccountId || !sellerData.stripeOnboardingComplete) continue;

        let unitPrice = listing.price as number;
        let variantLabel = "";
        if (it.variantValueId && listing.variants) {
          const groups = listing.variants as Array<{
            id: string;
            name: string;
            values: Array<{ id: string; name: string; price: number; available: number }>;
          }>;
          let found = false;
          for (const group of groups) {
            const val = group.values.find((v: { id: string }) => v.id === it.variantValueId);
            if (val) {
              if (val.available < it.quantity) {
                return NextResponse.json(
                  { error: `Not enough stock for ${listing.title as string}` },
                  { status: 400 },
                );
              }
              if (val.price > 0) unitPrice = val.price;
              variantLabel = `${group.name}: ${val.name}`;
              found = true;
              break;
            }
          }
          if (!found) continue;
        }

        const shippingCost = (listing.shippingCost as number) || 0;
        totalShipping += shippingCost;
        const listingCurrency = ((listing.currency as string) || "SEK").toLowerCase();

        pendingItems.push({
          listingId: it.listingId,
          quantity: it.quantity,
          variantValueId: it.variantValueId,
          sellerId: listingSellerId,
          unitPrice,
          shippingCost,
          variantLabel,
          listingTitle: (listing.title as string) || "",
          currency: listingCurrency,
        });
        lineItems.push({
          price_data: {
            currency: listingCurrency,
            product_data: {
              name: listing.title as string,
              ...(variantLabel ? { description: variantLabel } : {}),
            },
            unit_amount: Math.round(unitPrice * 100),
          },
          quantity: it.quantity,
        });
      }

      if (pendingItems.length === 0) {
        return NextResponse.json(
          {
            error:
              "No cart items for this seller. Items may have been removed or the seller may need to complete payment setup.",
          },
          { status: 400 },
        );
      }

      if (totalShipping > 0) {
        lineItems.push({
          price_data: {
            currency: "sek",
            product_data: { name: "Shipping" },
            unit_amount: Math.round(totalShipping * 100),
          },
          quantity: 1,
        });
      }

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
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        customer: stripeCustomerId,
        line_items: lineItems,
        payment_intent_data: {
          transfer_data: {
            destination: (await db.collection("users").doc(cartSellerId).get()).data()!.stripeAccountId as string,
          },
        },
        metadata: {
          cartCheckout: "true",
          buyerId,
          sellerId: cartSellerId,
        },
        success_url: `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${appUrl}/cart`,
      });

      await db.collection("pending_cart_checkouts").doc(session.id).set({
        buyerId,
        items: pendingItems,
      });

      return NextResponse.json({ url: session.url });
    }

    // --- Single-item checkout ---
    if (!listingId) {
      return NextResponse.json(
        { error: "listingId is required" },
        { status: 400 },
      );
    }

    const listingDoc = await db.collection("listings").doc(listingId).get();
    if (!listingDoc.exists) {
      return NextResponse.json(
        { error: "Listing not found" },
        { status: 404 },
      );
    }
    const listing = listingDoc.data()!;

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
