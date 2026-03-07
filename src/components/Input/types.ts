/**
 * Input (Figma: Roy design system → input 82:882, input-checkbox-actions 322:4894).
 * Single-line text field. Optional leading checkbox and/or trailing icon button (16px gap).
 * Trailing button: default variant (error tone when error) without checkbox; transparent with checkbox.
 */

import type { MaterialSymbol } from "material-symbols";

export interface InputProps {
  /** Controlled value. */
  value?: string;
  /** Default value when uncontrolled. */
  defaultValue?: string;
  /** Called when value changes. */
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /** Placeholder text (grey-500 at rest). */
  placeholder?: string;
  /** Label above the input (bold/paragraph-sm, grey-950). */
  label?: string;
  /** Helper text below the input (medium/paragraph-sm, grey-800). */
  helperText?: string;
  /** Input type (e.g. text, email, password). */
  type?: React.HTMLInputHTMLAttributes<HTMLInputElement>["type"];
  /** Disabled state (grey-200 bg, grey-700 text). */
  disabled?: boolean;
  /** Error state (red-100 bg, red-600 border, red-700 text). */
  error?: boolean;

  /** Show checkbox before input (post-action layout). */
  leadingCheckbox?: boolean;
  /** Checkbox checked state (when leadingCheckbox). */
  checkboxChecked?: boolean;
  /** Checkbox change handler (when leadingCheckbox). */
  onCheckboxChange?: (checked: boolean) => void;
  /** Checkbox accessible name (when leadingCheckbox). */
  checkboxAriaLabel?: string;

  /** Trailing icon button (e.g. "add", "close"). When set, requires trailingAriaLabel. */
  trailingIcon?: MaterialSymbol;
  /** Trailing button click handler. */
  onTrailingClick?: () => void;
  /** Trailing button accessible name (required when trailingIcon is set). */
  trailingAriaLabel?: string;

  /** Input id for form/label association. */
  id?: string;
  /** Name for forms. */
  name?: string;
  /** Accessible label. */
  "aria-label"?: string;
  /** Applied to the root wrapper. */
  className?: string;
  /** Forwarded ref. */
  ref?: React.Ref<HTMLInputElement>;
  onFocus?: React.FocusEventHandler<HTMLInputElement>;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
}
