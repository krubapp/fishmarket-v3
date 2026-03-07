"use client";

import { Icon } from "@/components/Icon";

import type { ButtonProps, ButtonSize, ButtonVariant } from "./types";

const SIZE_CONFIG: Record<
  ButtonSize,
  { padding: string; height: string; gap: string; text: string; iconPx: number; rounded: string }
> = {
  mini: {
    padding: "py-1 px-2",
    height: "h-6",
    gap: "gap-1",
    text: "font-medium text-[length:var(--font-size-caption)] leading-[1.33]",
    iconPx: 12,
    rounded: "rounded-[4px]",
  },
  extraSmall: {
    padding: "p-3",
    height: "h-8",
    gap: "gap-2",
    text: "font-medium text-[length:var(--font-size-paragraph-sm)] leading-[1.43]",
    iconPx: 16,
    rounded: "rounded-full",
  },
  small: {
    padding: "p-3",
    height: "h-8",
    gap: "gap-2",
    text: "font-medium text-[length:var(--font-size-paragraph-sm)] leading-[1.43]",
    iconPx: 16,
    rounded: "rounded-full",
  },
  medium: {
    padding: "py-3 px-4",
    height: "",
    gap: "gap-2",
    text: "font-medium text-[length:var(--font-size-paragraph-md)] leading-[1.5]",
    iconPx: 20,
    rounded: "rounded-full",
  },
  large: {
    padding: "p-4",
    height: "h-14",
    gap: "gap-2",
    text: "font-medium text-[length:var(--font-size-paragraph-lg)] leading-[1.4]",
    iconPx: 24,
    rounded: "rounded-full",
  },
};

function getVariantClasses(
  variant: ButtonVariant,
  disabled: boolean,
  active: boolean
): string {
  const base =
    "inline-flex items-center justify-center transition-colors focus:outline-none disabled:pointer-events-none";
  if (disabled) {
    return `${base} border-2 border-transparent bg-grey-200 text-grey-700`;
  }
  if (active && variant === "subtle") {
    return `${base} border-2 border-transparent bg-blue-100 text-blue-900 focus:border-slate-900`;
  }
  switch (variant) {
    case "default":
      return `${base} border-2 border-transparent bg-slate-900 text-slate-100 hover:bg-slate-950 focus:border-slate-950`;
    case "subtle":
      return `${base} border-2 border-transparent bg-slate-100 text-slate-900 hover:bg-slate-200 hover:text-slate-950 focus:border-slate-400`;
    case "outline":
      return `${base} border border-slate-900 bg-slate-100 text-slate-900 hover:border-slate-950 hover:text-slate-950 focus:border-2 focus:border-slate-900`;
    case "transparent":
      return `${base} border-2 border-transparent bg-transparent text-slate-900 hover:text-slate-950 focus:border-slate-900`;
    default:
      return base;
  }
}

export function Button({
  children,
  size = "medium",
  variant = "default",
  leadingIcon,
  trailingIcon,
  disabled = false,
  active = false,
  onClick,
  type = "button",
  "aria-label": ariaLabel,
  className = "",
}: ButtonProps) {
  const config = SIZE_CONFIG[size];
  const variantClasses = getVariantClasses(variant, disabled, active);

  return (
    <button
      type={type}
      className={`${config.height} ${config.padding} ${config.gap} ${config.rounded} ${config.text} ${variantClasses} ${className}`}
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active ? true : undefined}
      aria-label={ariaLabel}
    >
      {leadingIcon && (
        <Icon
          name={leadingIcon}
          size={config.iconPx}
          className="shrink-0 text-current"
        />
      )}
      <span>{children}</span>
      {trailingIcon && (
        <Icon
          name={trailingIcon}
          size={config.iconPx}
          className="shrink-0 text-current"
        />
      )}
    </button>
  );
}
