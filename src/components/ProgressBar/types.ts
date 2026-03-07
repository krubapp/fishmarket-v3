/**
 * Progress bar (Figma: progress-bar, node 32:656).
 * Track slate-100, fill slate-900. Sizes: small (8px height), large (16px height).
 */

export type ProgressBarSize = "small" | "large";

export interface ProgressBarProps {
  /** Current value (0 ≤ value ≤ max). */
  value: number;
  /** Maximum value (default 1). Use value in 0–1 for percentage, or e.g. max={100} for 0–100. */
  max?: number;
  /** Bar height: small 8px, large 16px (default "large"). */
  size?: ProgressBarSize;
  /** Accessible label (e.g. "Upload progress 75%"). */
  "aria-label"?: string;
  /** Applied to the root wrapper. */
  className?: string;
}
