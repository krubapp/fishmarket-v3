import type { Order } from "@/lib/schemas/order";

const TRACKING_NUMBER = "101010293235859004495";
const CARRIER = "Postnord";

/**
 * Mock orders for the seller dashboard when there are no real orders.
 * Matches Figma Nike Fishing Maning 2026 → Order-cards (node 340:950):
 * Order #1001 (Filled/delivered), #1002 (Unified/pending), #1003 (Need Filament/needs_fulfillment).
 */
export function getMockSellerOrders(sellerId: string): Order[] {
  return [
    {
      id: "mock-order-1001",
      orderNumber: 1001,
      sellerId,
      buyerId: "mock-buyer-1",
      buyerName: "Emma Lindqvist",
      listingId: "mock-listing-1",
      listingTitle: "Slayer 10 pack 3 Inch",
      quantity: 1,
      unitPrice: 1299,
      totalAmount: 1299,
      currency: "SEK",
      status: "delivered",
      trackingNumber: TRACKING_NUMBER,
      carrier: CARRIER,
    },
    {
      id: "mock-order-1002",
      orderNumber: 1002,
      sellerId,
      buyerId: "mock-buyer-2",
      buyerName: "Oscar Nilsson",
      listingId: "mock-listing-2",
      listingTitle: "Wobble Grub",
      quantity: 2,
      unitPrice: 499,
      totalAmount: 998,
      currency: "SEK",
      status: "pending",
      trackingNumber: TRACKING_NUMBER,
      carrier: CARRIER,
    },
    {
      id: "mock-order-1003",
      orderNumber: 1003,
      sellerId,
      buyerId: "mock-buyer-3",
      buyerName: "Lisa Bergström",
      listingId: "mock-listing-3",
      listingTitle: "Baitfish Minnow",
      quantity: 1,
      unitPrice: 899,
      totalAmount: 899,
      currency: "SEK",
      status: "needs_fulfillment",
      trackingNumber: TRACKING_NUMBER,
      carrier: CARRIER,
    },
  ];
}
