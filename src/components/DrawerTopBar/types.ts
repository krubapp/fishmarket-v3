/**
 * Drawer top bar (Figma: Drawer-navebar, node 322:5273).
 * Bar for drawer header: back button (40px), center title (semi/body-md), optional action button (small subtle).
 */

import type { MaterialSymbol } from "material-symbols";

export interface DrawerTopBarProps {
  /** Center title (semi/body-md, grey-900). */
  title: string;
  /** Called when the back button is pressed. */
  onBack: () => void;
  /** Optional right-side action button label (e.g. "Add group"). */
  actionLabel?: string;
  /** Called when the action button is pressed. */
  onAction?: () => void;
  /** Optional icon for the action button (e.g. "add"). */
  actionIcon?: MaterialSymbol;
  /** Accessible label for the back button (default "Back"). */
  backAriaLabel?: string;
  /** When true, back button is disabled (greyed out, not clickable). */
  backDisabled?: boolean;
  /** When true, action button is disabled (greyed out, not clickable). */
  actionDisabled?: boolean;
  /** Applied to the root header. */
  className?: string;
}
