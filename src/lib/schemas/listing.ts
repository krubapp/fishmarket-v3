import { z } from "zod";

export const LISTING_CONDITIONS = ["new", "used", "refurbished"] as const;
export type ListingCondition = (typeof LISTING_CONDITIONS)[number];

export const LISTING_CATEGORIES = [
  "Lures",
  "Rods",
  "Reels",
  "Line",
  "Tackle",
  "Apparel",
  "Other",
] as const;

export const variantValueSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  price: z.number().min(0).default(0),
  available: z.number().int().min(0).default(0),
  imageUrl: z.string().url().optional(),
});

export type VariantValue = z.infer<typeof variantValueSchema>;

export const variantGroupSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  values: z.array(variantValueSchema),
});

export type VariantGroup = z.infer<typeof variantGroupSchema>;

export const listingFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  specifications: z.string().optional(),
  price: z.number().positive("Price must be positive"),
  shippingCost: z.number().min(0, "Shipping cost cannot be negative").optional(),
  currency: z.string(),
  condition: z.union([
    z.literal("new"),
    z.literal("used"),
    z.literal("refurbished"),
  ]),
  category: z.string().min(1, "Category is required"),
  acceptTerms: z.boolean().default(false),
  variants: z.array(variantGroupSchema).optional(),
});

export const listingSchema = listingFormSchema.extend({
  imageUrls: z.array(z.string().url()).min(1, "At least one image is required"),
});

export type ListingFormData = z.infer<typeof listingFormSchema>;
export type Listing = z.infer<typeof listingSchema> & {
  id?: string;
  createdAt?: { seconds: number; nanoseconds: number };
  sellerId?: string;
};
