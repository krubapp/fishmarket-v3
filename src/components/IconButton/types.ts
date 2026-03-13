/**
 * IconButton (Figma: icon-buttons -small 561:1274, icon-buttons -large 65:270,
 * icon-buttons-error small 599:3723, icon-buttons-error large 184:1356).
 * Circular icon-only button: size small (32px) or large (40px), icon 20px.
 * Variants: default (filled), subtle (light bg), outline, transparent, neutrals (white bg).
 * Tone: default (slate) or error (red). States: hover, focus (2px ring), disabled.
 */

import type { MaterialSymbol } from "material-symbols";

export type IconButtonSize = "small" | "large" | "xlarge";

export type IconButtonVariant =
  | "default"
  | "subtle"
  | "outline"
  | "transparent"
  | "neutrals";

export type IconButtonTone = "default" | "error";

export type IconButtonProps = {
  /** Icon name (Material Symbol). */
  name: MaterialSymbol;
  /** Size: small 32×32, large 40×40, xlarge 48×48. */
  size?: IconButtonSize;
  /** Visual variant. */
  variant?: IconButtonVariant;
  /** Tone: default (slate) or error (red). */
  tone?: IconButtonTone;
  /** Disabled state. */
  disabled?: boolean;
  /** Click handler. */
  onClick?: () => void;
  /** Accessible label (required for icon-only). */
  "aria-label": string;
  /** Root class. */
  className?: string;
  /** Icon stroke weight (Material Symbols wght axis). Lighter e.g. 300 for thinner strokes. */
  iconWeight?: 100 | 200 | 300 | 400 | 500 | 600 | 700;
};
