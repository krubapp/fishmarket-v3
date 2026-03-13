import { z } from "zod";

export const cartItemSchema = z.object({
  listingId: z.string(),
  quantity: z.number().int().min(1),
  variantValueId: z.string().optional(),
});

export type CartItem = z.infer<typeof cartItemSchema>;

export const cartSchema = z.object({
  items: z.array(cartItemSchema),
  updatedAt: z.union([z.object({ seconds: z.number(), nanoseconds: z.number() }), z.date()]).optional(),
});

export type Cart = z.infer<typeof cartSchema>;
