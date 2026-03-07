/**
 * ImageBlock (Figma: Images, node 157:828).
 * Sizes: small 48×48, medium 148×196, large 218×218.
 * Empty = placeholder; empty-action = add icon; image-filled = src with optional action (large).
 */

export type ImageBlockSize = "small" | "medium" | "large";

const dimensions: Record<ImageBlockSize, { width: number; height: number }> = {
  small: { width: 48, height: 48 },
  medium: { width: 148, height: 196 },
  large: { width: 218, height: 218 },
};

export const IMAGE_BLOCK_DIMENSIONS = dimensions;

const radius: Record<ImageBlockSize, number> = {
  small: 4,
  medium: 12,
  large: 12,
};

export const IMAGE_BLOCK_RADIUS = radius;

export type ImageBlockProps = {
  /** Image URL. Omit for empty/empty-action (placeholder + optional add icon). */
  src?: string | null;
  /** Alt text for the image. */
  alt?: string;
  /** Size variant (default "medium"). */
  size?: ImageBlockSize;
  /** When no src: called when block is clicked; shows add-photo icon centered (small/medium 24px). */
  onAdd?: () => void;
  /** When size is "large": optional action (e.g. like) shown as 40×40 button top-right. */
  onAction?: () => void;
  /** When false, border radius is 0 (square). Default true. */
  rounded?: boolean;

  /** Optional class for the root element. */
  className?: string;
};
