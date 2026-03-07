/**
 * Badge (Figma: Badge component set, node 452:32).
 * Variants: default, warning, error, success.
 */

export type BadgeVariant = "default" | "warning" | "error" | "success";

export type BadgeProps = {
  /** Badge label. */
  children: React.ReactNode;
  /** Visual variant (Figma Types). */
  variant?: BadgeVariant;
  /** Optional class for the root element. */
  className?: string;
};
