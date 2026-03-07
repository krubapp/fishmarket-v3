/**
 * Color block (Figma: color-blocks 509:2598, color filters 512:3142).
 * 24×24 color swatch; optional label below. Selected state: 2px border.
 */

export type ColorBlockColor =
  | "white"
  | "red"
  | "green"
  | "black"
  | "silver"
  | "yellow"
  | "blue";

export type ColorBlockProps = {
  /** Color variant (default "green"). */
  color?: ColorBlockColor;
  /** When set, show label below the block (Figma color filters layout). */
  label?: string;
  /** Selected state: 2px border #101828, 2px radius. */
  selected?: boolean;
  /** Optional class for the root element. */
  className?: string;
};
