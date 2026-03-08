"use client";

import { useState } from "react";
import { Icon } from "@/components/Icon";

import type { CheckboxProps } from "./types";

const BOX_SIZE = 24;

function getBoxClasses(checked: boolean, disabled: boolean, error: boolean): string {
  const base =
    "inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-[4px] border-2 transition-colors pointer-events-none " +
    "group-hover:border-slate-500 group-hover:bg-slate-200 " +
    "peer-focus-visible:border-slate-900 peer-focus-visible:bg-slate-100 " +
    "peer-disabled:pointer-events-none";
  if (disabled) {
    return `${base} border-slate-200 bg-grey-200 group-hover:border-slate-200 group-hover:bg-grey-200 peer-focus-visible:border-slate-200 peer-focus-visible:bg-grey-200`;
  }
  if (error) {
    return `${base} border-red-400 bg-red-100 group-hover:border-red-400 group-hover:bg-red-100 peer-focus-visible:border-red-400 peer-focus-visible:bg-red-100`;
  }
  if (checked) {
    return `${base} border-slate-400 bg-slate-100 group-hover:border-slate-500 group-hover:bg-slate-200 peer-focus-visible:border-slate-900`;
  }
  return `${base} border-slate-400 bg-white group-hover:border-slate-500 peer-focus-visible:border-slate-900 peer-focus-visible:bg-slate-100`;
}

function getCheckIconClass(checked: boolean, disabled: boolean, error: boolean): string {
  if (!checked) return "";
  if (disabled) return "text-grey-700";
  if (error) return "text-red-700";
  return "text-slate-900";
}

function getLabelClasses(disabled: boolean, error: boolean): string {
  const base =
    "font-medium text-[length:var(--font-size-paragraph-md)] leading-[1.5] select-none " +
    "group-hover:text-slate-950";
  if (disabled) return `${base} text-grey-700 group-hover:text-grey-700`;
  if (error) return `${base} text-red-700 group-hover:text-red-700`;
  return `${base} text-slate-900`;
}

export function Checkbox({
  checked: checkedProp,
  onChange,
  defaultChecked,
  disabled = false,
  error = false,
  label,
  id,
  name,
  "aria-label": ariaLabel,
  className = "",
}: CheckboxProps) {
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
      <span
        className={getBoxClasses(checked, disabled, error)}
        style={{ width: BOX_SIZE, height: BOX_SIZE }}
      >
        <Icon
          name="check"
          size={20}
          className={`transition-transform duration-(--duration-fast) ease-(--ease-spring) ${
            checked ? "scale-100" : "scale-0"
          } ${getCheckIconClass(checked, disabled, error)}`}
        />
      </span>
      {label != null && (
        <span className={getLabelClasses(disabled, error)}>{label}</span>
      )}
    </label>
  );
}
