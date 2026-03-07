/**
 * Dropdown (Figma: Menu 32:334, Menu-items 32:27).
 * Default: trigger row (label + chevron); Toggle: icon button. Panel with list of items (label, optional icon); states default/hover/active/disabled.
 */

import type { MaterialSymbol } from "material-symbols";

export type DropdownVariant = "default" | "toggle";

export interface DropdownItemOption {
  id: string;
  label: string;
  icon?: MaterialSymbol;
  disabled?: boolean;
}

export interface DropdownProps {
  /** Trigger style: "default" (label + chevron) or "toggle" (icon button). */
  variant?: DropdownVariant;
  /** Trigger label for variant="default" (e.g. "Last 6 months"). */
  label?: string;
  /** Selected item id (for default trigger display when controlled). */
  value?: string;
  /** Options shown in the panel. */
  items: DropdownItemOption[];
  /** Called when an item is selected. */
  onSelect?: (id: string) => void;
  /** Controlled open state. */
  open?: boolean;
  /** Called when open state changes. */
  onOpenChange?: (open: boolean) => void;
  /** Accessible label for trigger (e.g. "Select period"). */
  "aria-label"?: string;
  /** Applied to the root wrapper. */
  className?: string;
}
