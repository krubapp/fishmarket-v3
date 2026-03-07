/**
 * Textarea (Figma: Roy design system → text-area-items 88:1813).
 * Multi-line text field. States: rest (white, slate-400 border), active/focus (slate-900 border),
 * filled (slate-200 bg when has value), disabled (grey-200 bg, grey-700 text), error (red-100 bg, red-600 border).
 * Padding 16px 12px, border-radius 8px, body/body-md (16px, 1.5).
 */

export interface TextareaProps {
  /** Controlled value. */
  value?: string;
  /** Default value when uncontrolled. */
  defaultValue?: string;
  /** Called when value changes. */
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  /** Placeholder text (slate-400). */
  placeholder?: string;
  /** Label above the textarea (bold/paragraph-sm, grey-950). */
  label?: string;
  /** Helper text below the textarea (medium/paragraph-sm, grey-800). */
  helperText?: string;
  /** Disabled state (grey-200 bg, grey-700 text). */
  disabled?: boolean;
  /** Error state (red-100 bg, red-600 border, red-700 text). */
  error?: boolean;
  /** Number of visible rows (affects min-height). */
  rows?: number;
  /** Textarea id for form/label association. */
  id?: string;
  /** Name for forms. */
  name?: string;
  /** Accessible label. */
  "aria-label"?: string;
  /** Applied to the root wrapper. */
  className?: string;
  /** Forwarded ref. */
  ref?: React.Ref<HTMLTextAreaElement>;
  onFocus?: React.FocusEventHandler<HTMLTextAreaElement>;
  onBlur?: React.FocusEventHandler<HTMLTextAreaElement>;
}
