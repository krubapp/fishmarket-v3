/**
 * TrackInventoryCard (Figma: Track Inventory card, node 77:1368).
 * Card with header (title, subtitle, action link) and product inventory rows with progress bars.
 * Types: empty (one empty state row), single (one item, large bar), or multiple (2-col grid, small bars).
 */

export type TrackInventoryItem = {
  /** Product name (e.g. "Wobble Grub"). */
  name: string;
  /** Detail line (e.g. "100 sold / 500 amount"). */
  detail: string;
  /** Progress 0–1 (e.g. 0.58). */
  progress: number;
};

export type TrackInventoryCardProps = {
  /** Card title (default "Track Inventory"). */
  title?: string;
  /** Subtitle below title (default "Monitor stock in one place"). */
  subtitle?: string;
  /** Action link label (e.g. "Sign Up"). Omit to hide action. */
  actionLabel?: string;
  /** Called when action link is clicked. */
  onAction?: () => void;
  /** Inventory items. Empty array shows empty state (one "Empty" row with empty bar). */
  items: TrackInventoryItem[];
  /** Root class. */
  className?: string;
};
