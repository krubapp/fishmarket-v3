"use client";

import { Icon } from "@/components/Icon";

import type {
  IconButtonProps,
  IconButtonSize,
  IconButtonTone,
  IconButtonVariant,
} from "./types";

const SIZE_PX: Record<IconButtonSize, number> = { small: 32, large: 40 };
const ICON_PX = 20;

function getButtonClasses(
  variant: IconButtonVariant,
  tone: IconButtonTone,
  disabled: boolean
): string {
  const base =
    "inline-flex shrink-0 items-center justify-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:pointer-events-none";
  if (disabled) {
    return `${base} bg-grey-200 text-grey-700 focus:ring-grey-500`;
  }
  if (tone === "error") {
    const error = {
      default:
        "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 focus:ring-offset-0",
      subtle:
        "bg-red-50 text-red-600 hover:bg-red-100 focus:ring-red-500 focus:ring-offset-0",
      outline:
        "bg-slate-100 border border-red-600 text-red-600 hover:border-red-700 focus:ring-red-500 focus:ring-offset-0",
      transparent:
        "text-red-600 hover:bg-red-50 focus:ring-red-500 focus:ring-offset-0",
      neutrals:
        "bg-red-50 text-red-600 hover:bg-red-100 focus:ring-red-500 focus:ring-offset-0",
    };
    return `${base} ${error[variant]}`;
  }
  const neutral = {
    default:
      "bg-slate-900 text-white hover:bg-slate-950 focus:ring-slate-900 focus:ring-offset-0",
    subtle:
      "bg-slate-100 text-slate-900 hover:bg-slate-200 focus:ring-slate-900 focus:ring-offset-0",
    outline:
      "bg-slate-100 border border-slate-900 text-slate-900 hover:border-slate-950 focus:ring-slate-900 focus:ring-offset-0",
    transparent:
      "text-slate-900 hover:bg-slate-100 focus:ring-slate-900 focus:ring-offset-0",
    neutrals:
      "bg-white text-slate-900 hover:bg-slate-50 focus:ring-slate-900 focus:ring-offset-0 border border-slate-200",
  };
  return `${base} ${neutral[variant]}`;
}

export function IconButton({
  name,
  size = "small",
  variant = "default",
  tone = "default",
  disabled = false,
  onClick,
  "aria-label": ariaLabel,
  className = "",
}: IconButtonProps) {
  const px = SIZE_PX[size];

  return (
    <button
      type="button"
      className={`${getButtonClasses(variant, tone, disabled)} ${className}`}
      style={{ width: px, height: px }}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
    >
      <Icon name={name} size={ICON_PX} className="shrink-0" />
    </button>
  );
}
