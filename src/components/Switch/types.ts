/**
 * Switch (Figma: Roy design system → switch 88:2375).
 * Pill track with sliding thumb. Sizes: Small (42×24, 18px thumb), Medium (56×34, 28px thumb).
 * States: default, hover, active (on), disabled, error.
 */

export type SwitchSize = "small" | "medium";

export interface SwitchProps {
  /** Controlled checked state. */
  checked?: boolean;
  /** Called when checked state changes. */
  onChange?: (checked: boolean) => void;
  /** Default checked when uncontrolled. */
  defaultChecked?: boolean;
  /** Disabled state (grey-200 track, grey-700 thumb). */
  disabled?: boolean;
  /** Error state (red-200 track, red-700 thumb). */
  error?: boolean;
  /** Size: small (42×24) or medium (56×34). */
  size?: SwitchSize;
  /** Label text or node shown next to the switch. */
  label?: React.ReactNode;
  /** Input id for form/label association. */
  id?: string;
  /** Input name for forms. */
  name?: string;
  /** Accessible name when no `label` prop. */
  "aria-label"?: string;
  /** Applied to the root label. */
  className?: string;
}
