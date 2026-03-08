"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Icon } from "@/components/Icon";
import { IconButton } from "@/components/IconButton";

import type { DropdownProps, DropdownItemOption } from "./types";

const PANEL_SHADOW =
  "0 1px 2px rgba(0,0,0,0.04), 0 4px 4px rgba(0,0,0,0.03), 0 8px 5px rgba(0,0,0,0.02), 0 15px 6px rgba(0,0,0,0.01), 0 23px 6px rgba(0,0,0,0)";

/**
 * Menu-item (Figma 32:27): label + optional trailing icon; 8px padding, 8px gap.
 * States: default (white, slate-900), hover (slate-100, slate-950), focus (white, ring slate-400), active/selected (slate-200), disabled (grey-200, grey-700).
 */
function ItemRow({
  item,
  isFirst,
  isLast,
  selected,
  onSelect,
}: {
  item: DropdownItemOption;
  isFirst: boolean;
  isLast: boolean;
  selected: boolean;
  onSelect: (id: string) => void;
}) {
  return (
    <button
      type="button"
      disabled={item.disabled}
      onClick={() => !item.disabled && onSelect(item.id)}
      className={`flex w-full items-center gap-2 px-2 py-2 text-left font-medium text-[length:var(--font-size-paragraph-sm)] leading-[1.43] transition-[color,background-color,transform] duration-(--duration-press) ease-(--ease-spring) active:scale-[0.98]
        focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-inset
        disabled:cursor-not-allowed disabled:active:scale-100
        ${item.disabled
          ? "bg-grey-200 text-grey-700"
          : selected
            ? "bg-slate-200 text-slate-900"
            : "bg-white text-slate-900 hover:bg-slate-100 hover:text-slate-950 focus-visible:bg-white active:bg-slate-100"
        }
        ${isFirst ? "rounded-t-[4px]" : ""} ${isLast ? "rounded-b-[4px]" : ""} ${!isLast ? "border-b border-slate-200" : ""}`}
    >
      <span className="min-w-0 flex-1 truncate">{item.label}</span>
      {item.icon != null && (
        <Icon name={item.icon} size={16} className="shrink-0 text-current" />
      )}
    </button>
  );
}

export function Dropdown({
  variant = "default",
  label = "Select",
  value,
  items,
  onSelect,
  open: controlledOpen,
  onOpenChange,
  "aria-label": ariaLabel,
  className = "",
}: DropdownProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = (next: boolean) => {
    if (!isControlled) setInternalOpen(next);
    onOpenChange?.(next);
  };

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const selectedLabel = value != null ? items.find((i) => i.id === value)?.label : undefined;
  const displayLabel = selectedLabel ?? label;

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      {variant === "default" ? (
        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-label={ariaLabel ?? displayLabel}
          className="flex w-full min-w-[120px] items-center gap-1 rounded-[4px] bg-slate-100 px-2 py-2 font-medium text-slate-900 text-[length:var(--font-size-paragraph-sm)] leading-[1.43] transition-[color,background-color,transform] duration-(--duration-press) ease-(--ease-spring) active:scale-[0.97] hover:bg-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-inset"
        >
          <span className="min-w-0 flex-1 truncate text-left">{displayLabel}</span>
          <Icon name="keyboard_arrow_down" size={16} className="shrink-0 text-current" />
        </button>
      ) : (
        <IconButton
          name="more_vert"
          size="large"
          variant="transparent"
          aria-label={ariaLabel ?? "Open menu"}
          onClick={() => setOpen(!open)}
        />
      )}

      <AnimatePresence>
        {open && (
          <motion.div
            className="absolute z-50 mt-1 overflow-hidden rounded-[4px] border border-slate-200 bg-white py-0"
            style={{
              boxShadow: PANEL_SHADOW,
              ...(variant === "default" ? { left: 0, right: 0, minWidth: "100%" } : { right: 0, minWidth: 132 }),
            }}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15, ease: [0.33, 1, 0.68, 1] }}
            role="listbox"
            aria-label="Options"
          >
            {items.map((item, index) => (
              <ItemRow
                key={item.id}
                item={item}
                isFirst={index === 0}
                isLast={index === items.length - 1}
                selected={value != null && value === item.id}
                onSelect={(id) => {
                  onSelect?.(id);
                  setOpen(false);
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
