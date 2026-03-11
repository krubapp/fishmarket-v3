/**
 * ProductListing (Figma: single listing 492:7977, row layout 568:2576).
 * ImageBlock large (218×218) + white content panel. Content below (column) or right (row).
 */

/** Where to show content relative to the image: below (column) or right (row, items-center). */
export type ProductListingContentPosition = "below" | "right";

export type ProductListingProps = {
  /** Product image URL. */
  imageSrc: string;
  /** Alt for product image. */
  imageAlt?: string;
  /** Badge text (e.g. "NEW DROP"). Omit to hide. */
  badge?: string;
  /** Condition label (e.g. "Condition:"). */
  conditionLabel?: string;
  /** Condition value (e.g. "New"). */
  conditionValue?: string;
  /** Product title. */
  title: string;
  /** Price string (e.g. "SEK 1,299"). */
  price: string;
  /** Original/crossed-out price. Omit to hide. */
  originalPrice?: string;
  /** Seller avatar URL. Omit for placeholder. */
  sellerAvatarSrc?: string | null;
  /** Seller display name. */
  sellerName: string;
  /** Called when like/favorite on image is clicked. */
  onLike?: () => void;
  /** Content layout: "below" (column) or "right" (row, image left). Default "below". */
  contentPosition?: ProductListingContentPosition;
  /** Optional node rendered after seller row (e.g. "Buy again" button). */
  trailingContent?: React.ReactNode;
  /** Click handler for the entire card. */
  onClick?: () => void;
  /** Root class. */
  className?: string;
};
