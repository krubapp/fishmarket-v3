import type { MaterialSymbol } from "material-symbols";

export interface SnackbarProps {
  open: boolean;
  onClose: () => void;
  message: string;
  icon?: MaterialSymbol;
  /** Auto-dismiss delay in ms (default 4000). Set 0 to disable. */
  duration?: number;
  className?: string;
}
