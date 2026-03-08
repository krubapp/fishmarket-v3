export type ListingItemProps = {
  /** Product image URL; omit for placeholder */
  imageSrc?: string | null;
  /** Product title */
  title: string;
  /** Subtitle (e.g. "3 Variants") */
  subtitle?: string;
  /** Click handler for the entire row */
  onClick?: () => void;
  /** Root class */
  className?: string;
};
