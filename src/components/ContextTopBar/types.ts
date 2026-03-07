/**
 * Context top bar (Figma: top nav bar, types=Shopping — node 496:658).
 * Variant with back + section label, center title, filter and search actions.
 */

export type ContextTopBarProps = {
  backLabel: string;
  title: string;
  onBack?: () => void;
  onFilter?: () => void;
  onSearch?: () => void;
  className?: string;
};
