"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { IconButton } from "@/components/IconButton";

import type { DrawerProps } from "./types";

const DEFAULT_WIDTH = 320;

export function Drawer({
  open,
  onClose,
  children,
  title,
  side = "right",
  width = DEFAULT_WIDTH,
  closeOnBackdropClick = true,
  "aria-label": ariaLabel,
  className = "",
}: DrawerProps) {
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (typeof document === "undefined") return null;

  const panelWidth = Math.min(
    width,
    typeof window !== "undefined" ? window.innerWidth : width
  );
  const slideX = side === "right" ? "100%" : "-100%";

  return createPortal(
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-[100] flex"
          role="dialog"
          aria-modal="true"
          aria-label={title ?? ariaLabel}
        >
          <motion.div
            className="absolute inset-0 bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            aria-hidden
            onClick={closeOnBackdropClick ? onClose : undefined}
          />
          <motion.div
            className={`absolute top-0 bottom-0 flex flex-col bg-white shadow-lg ${
              side === "right"
                ? "right-0 border-l border-slate-200"
                : "left-0 border-r border-slate-200"
            } ${className}`}
            style={{ width: panelWidth, maxWidth: "100vw" }}
            initial={{ x: slideX }}
            animate={{ x: 0 }}
            exit={{ x: slideX }}
            transition={{ type: "tween", duration: 0.2, ease: [0.33, 1, 0.68, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            {title != null && (
              <div className="flex shrink-0 items-center justify-between gap-4 border-b border-slate-200 px-6 py-4">
                <h2 className="min-w-0 truncate font-medium text-slate-900 text-[length:var(--font-size-paragraph-lg)] leading-[var(--line-height-paragraph-lg)]">
                  {title}
                </h2>
                <IconButton
                  name="close"
                  size="small"
                  variant="transparent"
                  aria-label="Close"
                  onClick={onClose}
                />
              </div>
            )}
            <div className="min-h-0 flex-1 overflow-auto px-6 py-4">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
