/**
 * Banner (Figma: Roy design system → Banner 82:1625).
 * Callout block: optional icon (42×42), title (semi/body-lg, grey-950), optional description (medium/body-md, grey-900).
 * Column, center-aligned, 16px gap, 24px padding, yellow-100 background.
 */

export interface BannerProps {
  /** Main heading (semi/body-lg, 20px, grey-950). */
  title: string;
  /** Supporting text (medium/body-md, 16px, grey-900). */
  description?: string;
  /** Optional icon or image above title (e.g. <Icon name="info" size={42} />). Rendered at 42×42. */
  icon?: React.ReactNode;
  /** Root wrapper class. */
  className?: string;
}
