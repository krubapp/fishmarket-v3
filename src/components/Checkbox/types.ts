/**
 * Checkbox (Figma: checkbox 184:967, checkbox-items 505:2158).
 * 24×24 box, 4px radius, 2px border. Optional label: row, 12px gap, medium/body-md; label colors: default slate-900, hover slate-950, disabled grey-700, error red-700.
 */

export interface CheckboxProps {
  /** Controlled checked state. */
  checked?: boolean;
  /** Called when checked state changes. */
  onChange?: (checked: boolean) => void;
  /** Default checked when uncontrolled. */
  defaultChecked?: boolean;
  /** Disabled state (grey-200 bg, slate-200 border; checked shows grey-700 check). */
  disabled?: boolean;
  /** Error state (red-100 bg, red-400 border; checked shows red-700 check). */
  error?: boolean;
  /** Label text or node shown next to the box (Figma 505:2158: 12px gap, medium/body-md). */
  label?: React.ReactNode;
  /** Input id (for linking with a label elsewhere). */
  id?: string;
  /** Input name for forms. */
  name?: string;
  /** Accessible label (when no `label` prop). */
  "aria-label"?: string;
  /** Applied to the root label. */
  className?: string;
}
