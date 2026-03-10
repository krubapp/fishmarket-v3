import type { MaterialSymbol } from "material-symbols";

export type SnackbarPosition = "top" | "bottom";
export type SnackbarVariant = "default" | "success" | "error" | "warning" | "info";

export interface SnackbarProps {
  open: boolean;
  onClose: () => void;
  message: string;
  icon?: MaterialSymbol;
  /** Visual variant (default "default"). */
  variant?: SnackbarVariant;
  /** Auto-dismiss delay in ms (default 4000). Set 0 to disable. */
  duration?: number;
  /** Vertical position (default "bottom"). */
  position?: SnackbarPosition;
  className?: string;
}
