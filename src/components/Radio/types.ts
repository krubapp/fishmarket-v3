/**
 * Radio (Figma: Roy design system → radio button 24:2142, Radio list-items 26:2494).
 * Circle with optional inner dot when checked. Sizes: default 24×24, large 32×32.
 * States: default, hover, focus, disabled, error.
 * Label (26:2494): gap 4px (large) / 8px (default); medium/body-md (default) or medium/body-lg (large);
 * label colors: default slate-900, hover slate-950, disabled grey-700, error red-700.
 */

export interface RadioProps {
  /** Value for this option (used with name for grouping). */
  value: string;
  /** Whether this option is selected (controlled). */
  checked?: boolean;
  /** Input name – same for all options in a group. */
  name?: string;
  /** Called when selection changes (native change event or selected value). */
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /** Disabled state (grey border, no inner dot color emphasis). */
  disabled?: boolean;
  /** Error state (red-100 bg, red-600 border and dot). */
  error?: boolean;
  /** Label text or node next to the radio (Figma 26:2494: gap 4px large / 8px default, medium/body-md or body-lg). */
  label?: React.ReactNode;
  /** Size: default 24×24, large 32×32. */
  size?: "default" | "large";
  /** Input id (for linking with a label elsewhere). */
  id?: string;
  /** Accessible label when no `label` prop. */
  "aria-label"?: string;
  /** Applied to the root label. */
  className?: string;
}
