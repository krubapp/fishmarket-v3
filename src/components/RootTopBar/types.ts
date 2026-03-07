/**
 * Root top bar (Figma: top nav bar, types=dashboard — node 93:2260).
 * Dashboard variant: avatar + title + action icon buttons.
 */

export type RootTopBarProps = {
  title: string;
  avatarSrc?: string | null;
  onAddProduct?: () => void;
  onFeed?: () => void;
  onSearch?: () => void;
  className?: string;
};
