/**
 * Tabs (Figma: Tabs 144:1012, Tab-Variant-box 608:1926).
 * TabItem / TabsProps: underline variant. TabsBoxItem / TabsBoxProps: box variant.
 */

import type { MaterialSymbol } from "material-symbols";

export type TabItem = {
  id: string;
  label: string;
  /** Optional leading icon (e.g. account_circle). */
  icon?: MaterialSymbol;
  disabled?: boolean;
};

export type TabsProps = {
  /** Tab items. */
  tabs: TabItem[];
  /** Currently selected tab id. */
  value: string;
  /** Called when a tab is selected. */
  onValueChange: (id: string) => void;
  /** Optional class for the root element. */
  className?: string;
};

/** Item for box variant: icon above label, optional badge (e.g. count). */
export type TabsBoxItem = {
  id: string;
  label: string;
  /** Icon shown above label (e.g. receipt_long, inventory_2). */
  icon: MaterialSymbol;
  /** Optional badge text (e.g. "10"); rendered as warning Badge when present. */
  badge?: string;
  disabled?: boolean;
  /** When set, render as a link to this href instead of a button. */
  href?: string;
};

export type TabsBoxProps = {
  tabs: TabsBoxItem[];
  /** Currently selected tab id (for button mode) or current pathname (when using href). */
  value: string;
  /** Called when a tab is selected (button mode). Omit when all tabs use href. */
  onValueChange?: (id: string) => void;
  className?: string;
};
