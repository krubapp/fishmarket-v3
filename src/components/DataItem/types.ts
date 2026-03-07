/**
 * Data item (Figma: Data items, node 32:592).
 * Label + value row; value is semi/paragraph-sm-semi. When value is empty, shows "--".
 */

export interface DataItemProps {
  /** Label (e.g. "Amount"). */
  label: string;
  /** Value; when null/undefined/empty, shows "--". */
  value?: string | null;
  /** Applied to the root wrapper. */
  className?: string;
}
