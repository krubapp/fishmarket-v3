/**
 * Tooltip (Figma: Roy design system → Tooltip 106:2544).
 * Floating panel below trigger: white bg, 12px radius, shadow; arrow on top (default left-aligned or center).
 * Content: title (medium/body-xl grey-950), optional description (medium/body-md grey-900) 4px below; optional action 24px below.
 */

export interface TooltipProps {
  /** Trigger element (hover/focus shows tooltip). */
  children: React.ReactNode;
  /** Title text (medium/body-xl, grey-950). */
  title: string;
  /** Optional description (medium/body-md, grey-900), 4px below title. */
  description?: string;
  /** Optional action node (e.g. button), 24px below content. */
  action?: React.ReactNode;
  /** Arrow alignment: default = left-aligned (24px from panel left), center = centered. */
  arrowPlacement?: "default" | "center";
  /** Delay (ms) before showing on hover. */
  openDelay?: number;
  /** Delay (ms) before hiding after pointer leaves. */
  closeDelay?: number;
  /** Applied to the trigger wrapper. */
  className?: string;
}
