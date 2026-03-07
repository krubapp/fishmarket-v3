/**
 * Link (Figma: Link, node 32:3837).
 * Text link with optional trailing chevron. Sizes: small (paragraph-sm), medium (body-md).
 * States: default, hover, focus (2px underline), disabled.
 */

export type LinkSize = "small" | "medium";

export type LinkProps = {
  /** Link label (e.g. "Sign Up"). */
  children: React.ReactNode;
  /** When set, renders as <a href="...">; otherwise use as button with onClick. */
  href?: string;
  /** When href is not set, called on click. */
  onClick?: () => void;
  /** Size: small (14px), medium (16px). */
  size?: LinkSize;
  /** Show trailing chevron_right icon (16px). */
  showIcon?: boolean;
  /** Disabled state (grey-700, no pointer). */
  disabled?: boolean;
  /** Root class. */
  className?: string;
  /** Anchor attributes when href is set (e.g. target, rel). */
  target?: React.AnchorHTMLAttributes<HTMLAnchorElement>["target"];
  rel?: string;
};
