/**
 * Button (Figma: Button-mini 295:3020, Button-extra small 604:10317,
 * Button-small 295:2939, Button-medium 82:993, Button-larger 10:116).
 * Text button with optional leading/trailing icon. Sizes: mini, extraSmall, small, medium, large.
 * Variants: default (filled), subtle, outline, transparent. States: hover, focus (2px border), disabled; mini has active (pressed).
 */

import type { MaterialSymbol } from "material-symbols";

export type ButtonSize =
  | "mini"
  | "extraSmall"
  | "small"
  | "medium"
  | "large";

export type ButtonVariant =
  | "default"
  | "subtle"
  | "outline"
  | "transparent";

export interface ButtonProps {
  /** Button label. */
  children: React.ReactNode;
  /** Size: mini (24px, caption), extraSmall/small (32px, paragraph-sm), medium (body-md), large (56px, body-lg). */
  size?: ButtonSize;
  /** Visual variant. */
  variant?: ButtonVariant;
  /** Leading icon (Material Symbol name). */
  leadingIcon?: MaterialSymbol;
  /** Trailing icon (Material Symbol name). */
  trailingIcon?: MaterialSymbol;
  /** Disabled state. */
  disabled?: boolean;
  /** Loading state — shows spinner and disables the button. */
  loading?: boolean;
  /** Mini only: active/pressed state (blue tint). */
  active?: boolean;
  /** Click handler. */
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  /** type="submit" for forms. */
  type?: "button" | "submit";
  /** Accessible name when label isn’t sufficient. */
  "aria-label"?: string;
  /** Root class. */
  className?: string;
}
