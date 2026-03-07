/**
 * Avatar (Figma: avator 44:71, with label 568:2325 below / avator-ds-16 93:2208 right).
 * Circular image or placeholder; sizes 16, 24, 32, 48, 56, 80.
 */

export type AvatarSize = 16 | 24 | 32 | 48 | 56 | 80;

/** When label is set: show it below (column) or to the right (row) of the avatar. */
export type AvatarLabelPosition = "below" | "right";

export type AvatarProps = {
  /** Image URL. Omit for default placeholder (person icon). */
  src?: string | null;
  /** Alt text for the image. */
  alt?: string;
  /** Size in pixels (default 32). */
  size?: AvatarSize;
  /** Optional label (below or right of avatar per labelPosition). */
  label?: string;
  /** Label layout when label is set: "below" (column, centered) or "right" (row, 8px gap). Default "below". */
  labelPosition?: AvatarLabelPosition;
  /** Optional class for the root element. */
  className?: string;
};
