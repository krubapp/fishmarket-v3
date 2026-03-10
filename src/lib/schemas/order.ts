import { z } from "zod";
import type { BadgeVariant } from "@/components/Badge";

export const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "shipped",
  "delivered",
  "needs_fulfillment",
  "return_requested",
  "returned",
  "cancelled",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  shipped: "Shipped",
  delivered: "Delivered",
  needs_fulfillment: "Needs Fulfillment",
  return_requested: "Return Product",
  returned: "Returned",
  cancelled: "Cancelled",
};

export const ORDER_STATUS_BADGE_VARIANT: Record<OrderStatus, BadgeVariant> = {
  pending: "default",
  confirmed: "default",
  shipped: "success",
  delivered: "success",
  needs_fulfillment: "warning",
  return_requested: "error",
  returned: "error",
  cancelled: "default",
};

export const orderSchema = z.object({
  orderNumber: z.number().int().positive(),
  sellerId: z.string().min(1),
  buyerId: z.string().min(1),
  buyerName: z.string().min(1),
  buyerEmail: z.string().email().optional(),
  listingId: z.string().min(1),
  listingTitle: z.string().min(1),
  quantity: z.number().int().positive().default(1),
  unitPrice: z.number().min(0),
  totalAmount: z.number().min(0),
  currency: z.string().default("SEK"),
  status: z.enum(ORDER_STATUSES),
  trackingNumber: z.string().optional(),
  carrier: z.string().optional(),
  shippingAddress: z.string().optional(),
});

export type OrderFormData = z.infer<typeof orderSchema>;

export type Order = OrderFormData & {
  id?: string;
  createdAt?: { seconds: number; nanoseconds: number };
  updatedAt?: { seconds: number; nanoseconds: number };
};
