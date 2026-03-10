"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { MaterialSymbol } from "material-symbols";

import { Snackbar } from "@/components/Snackbar";
import type { SnackbarVariant } from "@/components/Snackbar";

type ToastState = {
  open: boolean;
  message: string;
  icon?: MaterialSymbol;
  variant: SnackbarVariant;
};

type ToastFn = (message: string, icon?: MaterialSymbol) => void;

type ToastContextValue = {
  toast: ToastFn;
  success: ToastFn;
  error: ToastFn;
  warning: ToastFn;
  info: ToastFn;
};

const DEFAULT_ICONS: Record<Exclude<SnackbarVariant, "default">, MaterialSymbol> = {
  success: "check_circle",
  error: "error",
  warning: "warning",
  info: "info",
};

const ToastContext = createContext<ToastContextValue>({
  toast: () => {},
  success: () => {},
  error: () => {},
  warning: () => {},
  info: () => {},
});

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ToastState>({
    open: false,
    message: "",
    variant: "default",
  });

  const show = useCallback(
    (variant: SnackbarVariant, message: string, icon?: MaterialSymbol) => {
      const resolvedIcon =
        icon ?? (variant !== "default" ? DEFAULT_ICONS[variant] : undefined);
      setState({ open: true, message, icon: resolvedIcon, variant });
    },
    [],
  );

  const close = useCallback(() => {
    setState((s) => ({ ...s, open: false }));
  }, []);

  const value = useMemo<ToastContextValue>(
    () => ({
      toast: (msg, icon) => show("default", msg, icon),
      success: (msg, icon) => show("success", msg, icon),
      error: (msg, icon) => show("error", msg, icon),
      warning: (msg, icon) => show("warning", msg, icon),
      info: (msg, icon) => show("info", msg, icon),
    }),
    [show],
  );

  return (
    <ToastContext value={value}>
      {children}
      <Snackbar
        open={state.open}
        onClose={close}
        message={state.message}
        icon={state.icon}
        variant={state.variant}
        position="top"
      />
    </ToastContext>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
