"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";

import { Icon } from "@/components/Icon";

import type { SnackbarProps } from "./types";

export function Snackbar({
  open,
  onClose,
  message,
  icon,
  duration = 4000,
  className = "",
}: SnackbarProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.2, ease: [0.33, 1, 0.68, 1] }}
          className={`fixed bottom-[100px] left-1/2 z-50 -translate-x-1/2 ${className}`}
        >
          <div className="flex items-center gap-2 whitespace-nowrap rounded-full bg-slate-900 px-6 py-3 shadow-lg">
            {icon && (
              <Icon name={icon} size={20} className="shrink-0 text-white" />
            )}
            <span className="font-medium text-white text-paragraph-md leading-normal">
              {message}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
