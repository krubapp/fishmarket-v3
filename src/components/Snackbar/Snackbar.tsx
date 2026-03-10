"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";

import { Icon } from "@/components/Icon";

import type { SnackbarProps, SnackbarVariant } from "./types";

const variantStyles: Record<SnackbarVariant, { pill: string; icon: string; text: string }> = {
  default: { pill: "bg-slate-900", icon: "text-white", text: "text-white" },
  success: { pill: "bg-green-100", icon: "text-green-700", text: "text-green-900" },
  error:   { pill: "bg-red-100",   icon: "text-red-700",   text: "text-red-900" },
  warning: { pill: "bg-yellow-100", icon: "text-yellow-700", text: "text-yellow-900" },
  info:    { pill: "bg-blue-100",  icon: "text-blue-700",  text: "text-blue-900" },
};

export function Snackbar({
  open,
  onClose,
  message,
  icon,
  variant = "default",
  duration = 4000,
  position = "bottom",
  className = "",
}: SnackbarProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTop = position === "top";
  const styles = variantStyles[variant];

  useEffect(() => {
    if (open && duration > 0) {
      timerRef.current = setTimeout(onClose, duration);
      return () => {
        if (timerRef.current) clearTimeout(timerRef.current);
      };
    }
  }, [open, duration, onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          role="status"
          aria-live="polite"
          initial={{ opacity: 0, y: isTop ? -16 : 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: isTop ? -16 : 16 }}
          transition={{ duration: 0.2, ease: [0.33, 1, 0.68, 1] }}
          className={`fixed left-1/2 z-50 -translate-x-1/2 ${isTop ? "top-[env(safe-area-inset-top,16px)]" : "bottom-[100px]"} ${className}`}
        >
          <div className={`flex items-center gap-2 whitespace-nowrap rounded-full px-6 py-3 shadow-lg ${styles.pill}`}>
            {icon && (
              <Icon name={icon} size={20} className={`shrink-0 ${styles.icon}`} />
            )}
            <span className={`font-medium text-paragraph-md leading-normal ${styles.text}`}>
              {message}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
