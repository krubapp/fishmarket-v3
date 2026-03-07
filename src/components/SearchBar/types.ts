/**
 * Search bar (Figma: Search-bar, node 496:4771).
 * Input with leading search icon, optional trailing clear, Cancel button,
 * and optional floating results panel (Figma 496:4769 Order-cards).
 */

export type SearchBarResult = {
  id: string;
  title: string;
  sellerName: string;
  sellerAvatarSrc?: string | null;
};

export type SearchBarProps = {
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  onValueChange?: (value: string) => void;
  onSubmit?: (value: string) => void;
  onCancel?: () => void;
  showCancel?: boolean;
  results?: SearchBarResult[];
  onResultSelect?: (result: SearchBarResult) => void;
  className?: string;
};
