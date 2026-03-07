/**
 * Accordion (Figma: Roy design system → accordion-basic 553:4285).
 * Expandable panel: trigger row (title + chevron) + collapsible content.
 * Padding 24px, gap 24px between trigger and content; trigger row gap 12px.
 * Title: semi/body-lg (20px), slate-900 (hover slate-950, disabled grey-700). Chevron 40×40 transparent.
 * States: default, hover, focus, disabled (bg grey-200).
 */

export interface AccordionItemProps {
  /** Trigger label (semi/body-lg). */
  title: string;
  /** Optional content in the header row between title and chevron (e.g. ratings, badge). */
  headerRight?: React.ReactNode;
  /** Content when expanded. */
  children: React.ReactNode;
  /** Controlled open state. */
  open?: boolean;
  /** Called when open state changes. */
  onOpenChange?: (open: boolean) => void;
  /** Default open when uncontrolled. */
  defaultOpen?: boolean;
  /** Disabled state (grey-200 bg, grey-700 text). */
  disabled?: boolean;
  /** Root wrapper class. */
  className?: string;
}

export interface AccordionProps {
  /** Accordion items: title, optional headerRight, content. */
  items: Array<{ title: string; headerRight?: React.ReactNode; content: React.ReactNode }>;
  /** Allow multiple panels open. If false, only one open at a time. */
  allowMultiple?: boolean;
  /** Controlled: open keys (item indices or ids). */
  value?: number[];
  /** Called when open set changes (indices). */
  onValueChange?: (value: number[]) => void;
  /** Root wrapper class. */
  className?: string;
}
