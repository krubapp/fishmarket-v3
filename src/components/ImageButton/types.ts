/**
 * ImageButton (Figma: image-buttons, node 535:1122).
 * Clickable image: 100×100, 4px radius. States: default, hover (grey overlay), selected (1px border #101828).
 */

export type ImageButtonProps = {
  /** Image URL. */
  src: string;
  /** Alt text (required for accessibility). */
  alt: string;
  /** Selected state: 1px border slate-900. */
  selected?: boolean;
  /** Click handler. */
  onClick?: () => void;
  /** Accessible label (optional; falls back to alt). */
  "aria-label"?: string;
  /** Root class. */
  className?: string;
};
