"use client";

import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import type { TooltipProps } from "./types";

const ARROW_SIZE = 14;
const GAP = 8;
const PANEL_SHADOW = "0px 0px 27px 0px rgba(0, 0, 0, 0.25)";

export function Tooltip({
  children,
  title,
  description,
  action,
  arrowPlacement = "default",
  openDelay = 200,
  closeDelay = 100,
  className = "",
}: TooltipProps) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const openTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = useCallback(() => {
    if (openTimerRef.current) {
      clearTimeout(openTimerRef.current);
      openTimerRef.current = null;
    }
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const show = useCallback(() => {
    clearTimers();
    openTimerRef.current = setTimeout(() => setOpen(true), openDelay);
  }, [openDelay, clearTimers]);

  const hide = useCallback(() => {
    clearTimers();
    closeTimerRef.current = setTimeout(() => setOpen(false), closeDelay);
  }, [closeDelay, clearTimers]);

  useLayoutEffect(() => {
    if (!open || !triggerRef.current || !panelRef.current) {
      setPosition(null);
      return;
    }
    const rect = triggerRef.current.getBoundingClientRect();
    const panelWidth = panelRef.current.offsetWidth;
    const left =
      arrowPlacement === "center"
        ? rect.left + rect.width / 2 - panelWidth / 2
        : rect.left;
    setPosition({
      top: rect.bottom + GAP,
      left,
    });
  }, [open, arrowPlacement, title, description, action]);

  return (
    <>
      <div
        ref={triggerRef}
        className={`inline-block ${className}`}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
      >
        {children}
      </div>
      {open &&
        createPortal(
          <div
            ref={panelRef}
            role="tooltip"
            className="fixed z-50 flex flex-col rounded-xl bg-white p-6 shadow-lg"
            style={{
              boxShadow: PANEL_SHADOW,
              ...(position
                ? { top: position.top, left: position.left }
                : { visibility: "hidden" as const }),
            }}
            onMouseEnter={show}
            onMouseLeave={hide}
          >
            {/* Arrow: rotated square at top (Figma: 27.71×27.71 diamond, ~20px from top) */}
            <span
              className="absolute h-[14px] w-[14px] rotate-45 bg-white"
              style={{
                top: -ARROW_SIZE / 2,
                left: arrowPlacement === "center" ? "50%" : 24,
                marginLeft: arrowPlacement === "center" ? -ARROW_SIZE / 2 : 0,
                boxShadow: PANEL_SHADOW,
              }}
            />
            <div className="relative flex flex-col gap-1">
              <p
                className="font-medium text-grey-950"
                style={{
                  fontSize: "var(--font-size-paragraph-xl)",
                  lineHeight: "var(--line-height-paragraph-xl)",
                }}
              >
                {title}
              </p>
              {description != null && (
                <p className="font-medium text-grey-900 text-[length:var(--font-size-paragraph-md)] leading-[1.5]">
                  {description}
                </p>
              )}
            </div>
            {action != null && <div className="mt-6">{action}</div>}
          </div>,
          document.body
        )}
    </>
  );
}
