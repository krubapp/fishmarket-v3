import type { Listing } from "@/lib/schemas/listing";

export type ListingFormMode = "create" | "edit";

export type ListingFormProps = {
  mode: ListingFormMode;
  /** Existing listing data for edit mode. */
  initialData?: Listing;
};
