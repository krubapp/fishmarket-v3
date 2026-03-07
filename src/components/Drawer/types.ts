/**
 * Drawer: slide-in panel with overlay. Use for filters, settings, or secondary content.
 * Styling aligned with Roy design system (white panel, slate borders, theme spacing).
 */

export type DrawerSide = "left" | "right";

export interface DrawerProps {
  /** When true, drawer and overlay are visible. */
  open: boolean;
  /** Called when the drawer should close (backdrop click, close button, or Escape). */
  onClose: () => void;
  /** Panel content. */
  children: React.ReactNode;
  /** Optional title shown in the panel header with a close button. */
  title?: string;
  /** Which edge the panel slides in from (default "right"). */
  side?: DrawerSide;
  /** Panel width in pixels (default 320). Max 100vw. */
  width?: number;
  /** Close when clicking the backdrop (default true). */
  closeOnBackdropClick?: boolean;
  /** Accessible label for the dialog when no title (e.g. "Filters"). */
  "aria-label"?: string;
  /** Applied to the panel (not the overlay). */
  className?: string;
}
