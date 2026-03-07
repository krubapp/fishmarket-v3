"use client";

import { useState } from "react";

import type { SwitchProps } from "./types";

const SIZE = {
  small: {
    track: "w-[42px] h-6 px-[3px]",
    thumb: "size-[18px]",
    thumbTranslate: "translate-x-[18px]", // 42 - 18 - 6
  },
  medium: {
    track: "w-14 h-[34px] px-1 py-[3px]", // 56×34, padding 3px 4px
    thumb: "size-7", // 28px
    thumbTranslate: "translate-x-[20px]", // 56 - 28 - 8
  },
} as const;

function getTrackClasses(
  checked: boolean,
  disabled: boolean,
  error: boolean,
  size: "small" | "medium"
): string {
  const base =
    "inline-flex shrink-0 items-center rounded-[140px] border transition-colors pointer-events-none " +
    "group-hover:border-slate-950 group-hover:bg-slate-200 " +
    "peer-focus-visible:border-slate-950 peer-focus-visible:bg-slate-200 " +
    "peer-disabled:pointer-events-none " +
    SIZE[size].track;
  if (disabled) {
    return `${base} border-transparent bg-grey-200 group-hover:border-transparent group-hover:bg-grey-200 peer-focus-visible:border-transparent peer-focus-visible:bg-grey-200`;
  }
  if (error) {
    return `${base} border-transparent bg-red-200 group-hover:border-transparent group-hover:bg-red-200 peer-focus-visible:border-transparent peer-focus-visible:bg-red-200`;
  }
  if (checked) {
    return `${base} border-transparent bg-slate-900 group-hover:bg-slate-800 peer-focus-visible:bg-slate-800`;
  }
  return `${base} border-slate-200 bg-slate-100`;
}

function getThumbClasses(checked: boolean, disabled: boolean, error: boolean, size: "small" | "medium"): string {
  const transition = "transition-transform duration-200 ease-out";
  const translate = checked ? SIZE[size].thumbTranslate : "translate-x-0";
  const base =
    "inline-block rounded-full pointer-events-none " +
    "shadow-[0px_0px_1px_0_rgba(0,0,0,0.1),0px_1px_1px_0_rgba(0,0,0,0.09),0px_3px_2px_0_rgba(0,0,0,0.05),0px_5px_2px_0_rgba(0,0,0,0.01),0px_8px_2px_0_rgba(0,0,0,0)] " +
    `${transition} ${translate} ` +
    SIZE[size].thumb;
  if (disabled) return `${base} bg-grey-700`;
  if (error) return `${base} bg-red-700`;
  if (checked) return `${base} bg-slate-100`;
  return `${base} bg-white`;
}

function getLabelClasses(disabled: boolean, error: boolean): string {
  const base =
    "font-medium text-[length:var(--font-size-paragraph-md)] leading-[1.5] select-none " +
    "group-hover:text-slate-950";
  if (disabled) return `${base} text-grey-700 group-hover:text-grey-700`;
  if (error) return `${base} text-red-700 group-hover:text-red-700`;
  return `${base} text-slate-900`;
}

export function Switch({
  checked: checkedProp,
  onChange,
  defaultChecked,
  disabled = false,
  error = false,
  size = "medium",
  label,
  id,
  name,
  "aria-label": ariaLabel,
  className = "",
}: SwitchProps) {
  const isControlled = checkedProp !== undefined;
  const [internalChecked, setInternalChecked] = useState(defaultChecked ?? false);
  const checked = isControlled ? !!checkedProp : internalChecked;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isControlled) setInternalChecked(e.target.checked);
    onChange?.(e.target.checked);
  };

  return (
    <label
      className={`group inline-flex cursor-pointer items-center gap-3 ${disabled ? "cursor-not-allowed" : ""} ${className}`}
    >
      <input
        type="checkbox"
        role="switch"
        id={id}
        name={name}
        className="sr-only peer"
        checked={isControlled ? checkedProp : undefined}
        defaultChecked={!isControlled ? defaultChecked : undefined}
        onChange={handleChange}
        disabled={disabled}
        aria-label={label == null ? ariaLabel : undefined}
        aria-invalid={error ? true : undefined}
      />
      <span className={getTrackClasses(checked, disabled, error, size)}>
        <span className={getThumbClasses(checked, disabled, error, size)} />
      </span>
      {label != null && (
        <span className={getLabelClasses(disabled, error)}>{label}</span>
      )}
    </label>
  );
}
