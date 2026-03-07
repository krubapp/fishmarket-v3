export interface VariantOptionButtonProps {
  /** Button label (e.g. "large", "medium") */
  children: React.ReactNode;
  /** Selected state: grey-200 fill, slate-200 border, grey-700 text */
  selected?: boolean;
  /** Click handler */
  onClick?: () => void;
  /** Disabled state */
  disabled?: boolean;
  /** Accessible name when label isn’t descriptive enough */
  "aria-label"?: string;
  /** Applied to the root `<button>` */
  className?: string;
}
