import { NextResponse } from "next/server";
import { getFirestore } from "firebase-admin/firestore";
import { getAdminApp } from "@/lib/firebase-admin";

export const dynamic = "force-dynamic";

export type SellerAnalytics = {
  earningBalance: number;
  lifetimeEarning: number;
  lastPayout: number;
  nextPayout: number;
  currency: string;
  totalOrders: number;
  shippedOrders: number;
  pendingOrders: number;
};

const COMPLETED_STATUSES = ["shipped", "delivered"];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sellerId = searchParams.get("sellerId");

  if (!sellerId) {
    return NextResponse.json(
      { error: "sellerId is required" },
      { status: 400 },
    );
  }

  try {
    const db = getFirestore(getAdminApp());
    const ordersSnap = await db
      .collection("orders")
      .where("sellerId", "==", sellerId)
      .get();

    let earningBalance = 0;
    let totalOrders = 0;
    let shippedOrders = 0;
    let pendingOrders = 0;

    ordersSnap.forEach((doc) => {
      const data = doc.data();
      totalOrders++;

      if (COMPLETED_STATUSES.includes(data.status)) {
        earningBalance += data.totalAmount ?? 0;
        shippedOrders++;
      }

      if (data.status === "pending" || data.status === "confirmed" || data.status === "needs_fulfillment") {
        pendingOrders++;
      }
    });

    const analytics: SellerAnalytics = {
      earningBalance,
      lifetimeEarning: earningBalance,
      lastPayout: 0,
      nextPayout: 0,
      currency: "SEK",
      totalOrders,
      shippedOrders,
      pendingOrders,
    };

    return NextResponse.json(analytics);
  } catch (error) {
    console.error("Failed to fetch seller analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 },
    );
  }
}
