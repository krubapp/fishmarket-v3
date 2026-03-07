"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
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
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    if (!open) {
      setEntered(false);
      return;
    }
    const id = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(id);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  const panelStyle = {
    width: Math.min(width, typeof window !== "undefined" ? window.innerWidth : width),
    maxWidth: "100vw",
  };

  const translate = side === "right" ? "translateX(100%)" : "translateX(-100%)";
  const translateEnd = "translateX(0)";

  const content = (
    <div
      className="fixed inset-0 z-50 flex"
      role="dialog"
      aria-modal="true"
      aria-label={title ?? ariaLabel}
    >
      <div
        className="absolute inset-0 bg-black/50 transition-opacity duration-200"
        aria-hidden
        onClick={closeOnBackdropClick ? onClose : undefined}
      />
      <div
        className={`absolute top-0 bottom-0 flex flex-col bg-white shadow-lg transition-transform duration-200 ease-out ${
          side === "right" ? "right-0 border-l border-slate-200" : "left-0 border-r border-slate-200"
        } ${className}`}
        style={{
          ...panelStyle,
          transform: entered ? translateEnd : translate,
        }}
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
        <div className="min-h-0 flex-1 overflow-auto px-6 py-4">{children}</div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
