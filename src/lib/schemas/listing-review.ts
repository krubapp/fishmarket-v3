import { z } from "zod";

export const listingReviewSchema = z.object({
  listingId: z.string().min(1),
  userId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  text: z.string().max(2000).optional().default(""),
});

export type ListingReview = z.infer<typeof listingReviewSchema> & {
  id?: string;
  createdAt?: { seconds: number; nanoseconds: number };
};

export type CreateListingReviewInput = Omit<ListingReview, "id" | "createdAt">;
