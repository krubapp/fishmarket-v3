/**
 * Rating (Figma: Roy design system → ratings 552:482).
 * Row of 5 stars (24×24). Filled stars slate-900, empty stars grey-300.
 * Value 0–5 (integer). Optional interactive (onChange).
 */

export interface RatingProps {
  /** Current value 0–5 (number of filled stars). */
  value: number;
  /** Maximum stars (default 5). */
  max?: number;
  /** Called when user selects a new value (star index 1-based). Omit for read-only. */
  onChange?: (value: number) => void;
  /** Star size in px (default 24). */
  size?: number;
  /** Disabled when interactive (default false). */
  disabled?: boolean;
  /** Root wrapper class. */
  className?: string;
}
