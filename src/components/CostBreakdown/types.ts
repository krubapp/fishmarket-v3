/**
 * CostBreakdown (Figma: Frame 369 / 358, node 596:1479).
 * Checkout cost summary: rows of label + value with optional highlighted total row.
 */

export type CostBreakdownRow = {
  /** Row label (e.g. "Subtotal (1)", "Shipping Fee", "Total amount"). */
  label: string;
  /** Row value (e.g. "SEK 2000.00", "150 SEK"). */
  value: string;
  /** When true, label uses primary color (#121412); otherwise grey (#8B9189). */
  highlightLabel?: boolean;
};

export type CostBreakdownProps = {
  /** Rows to show (e.g. subtotal, shipping, total). */
  rows: CostBreakdownRow[];
  /** Root class. */
  className?: string;
};
