"use client";

import type { RadioProps } from "./types";

const SIZE_MAP = {
  default: { outer: 24, dot: 12 },
  large: { outer: 32, dot: 16 },
} as const;

function getRingClasses(checked: boolean, disabled: boolean, error: boolean): string {
  const base =
    "inline-flex shrink-0 items-center justify-center rounded-full border-2 transition-colors pointer-events-none " +
    "bg-slate-100 border-slate-900 " +
    "group-hover:bg-slate-200 group-hover:border-slate-950 " +
    "peer-focus-visible:border-slate-900 peer-focus-visible:ring-2 peer-focus-visible:ring-slate-900 peer-focus-visible:ring-offset-2 " +
    "peer-disabled:pointer-events-none";
  if (disabled) {
    return `${base} border-slate-200 bg-slate-100 group-hover:border-slate-200 group-hover:bg-slate-100 peer-focus-visible:border-slate-200 peer-focus-visible:ring-0`;
  }
  if (error) {
    return `${base} border-red-600 bg-red-100 group-hover:border-red-600 group-hover:bg-red-100 peer-focus-visible:border-red-600 peer-focus-visible:ring-red-600`;
  }
  return base;
}

function getDotClasses(disabled: boolean, error: boolean): string {
  if (disabled) return "bg-grey-700";
  if (error) return "bg-red-600";
  return "bg-slate-900";
}

function getLabelClasses(
  size: "default" | "large",
  disabled: boolean,
  error: boolean
): string {
  const sizeStyles =
    size === "large"
      ? "text-[length:var(--font-size-paragraph-lg)] leading-[length:var(--line-height-paragraph-lg)]"
      : "text-[length:var(--font-size-paragraph-md)] leading-[1.5]";
  const base =
    `font-medium select-none group-hover:text-slate-950 ${sizeStyles}`;
  if (disabled) return `${base} text-grey-700 group-hover:text-grey-700`;
  if (error) return `${base} text-red-700 group-hover:text-red-700`;
  return `${base} text-slate-900`;
}

export function Radio({
  value,
  checked,
  name,
  onChange,
  disabled = false,
  error = false,
  label,
  size = "default",
  id,
  "aria-label": ariaLabel,
  className = "",
}: RadioProps) {
  const { outer, dot } = SIZE_MAP[size];

  const gapClass = size === "large" ? "gap-1" : "gap-2"; // Figma 26:2494: large 4px, default 8px

  return (
    <label
      className={`group inline-flex cursor-pointer items-center ${gapClass} ${disabled ? "cursor-not-allowed" : ""} ${className}`}
    >
      <input
        type="radio"
        id={id}
        name={name}
        value={value}
        className="sr-only peer"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        aria-label={label == null ? ariaLabel : undefined}
        aria-invalid={error ? true : undefined}
      />
      <span
        className={getRingClasses(!!checked, disabled, error)}
        style={{ width: outer, height: outer }}
      >
        {checked && (
          <span
            className={`rounded-full shrink-0 ${getDotClasses(disabled, error)}`}
            style={{ width: dot, height: dot }}
          />
        )}
      </span>
      {label != null && (
        <span className={getLabelClasses(size, disabled, error)}>{label}</span>
      )}
    </label>
  );
}
