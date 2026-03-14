"use client";

import { forwardRef, useId, useState } from "react";

import { Checkbox } from "@/components/Checkbox";
import { IconButton } from "@/components/IconButton";

import type { InputProps } from "./types";

const GAP = "gap-4"; // 16px

function getRootClasses(disabled: boolean, error: boolean, filled: boolean, focused: boolean, hover: boolean): string {
  const base =
    "flex min-w-0 items-center rounded-lg border px-3 py-2 h-10 transition-colors " +
    "focus-within:border-slate-900 " +
    "placeholder:text-grey-500";
  if (disabled) {
    return `${base} border-slate-200 bg-grey-200 focus-within:border-slate-200`;
  }
  if (error) {
    return `${base} border-red-600 bg-red-100 focus-within:border-red-600`;
  }
  if (focused) {
    return `${base} border-slate-900 bg-white`;
  }
  if (hover && !filled) {
    return `${base} border-slate-400 bg-slate-200`;
  }
  return `${base} border-slate-400 bg-white`;
}

function getInputClasses(disabled: boolean, error: boolean): string {
  const base =
    "w-full min-w-0 bg-transparent text-[length:var(--font-size-paragraph-md)] leading-[1.5] outline-none " +
    "text-slate-900 placeholder:text-grey-500";
  if (disabled) return `${base} cursor-not-allowed text-grey-700 placeholder:text-grey-500`;
  if (error) return `${base} text-red-700 placeholder:text-red-400`;
  return base;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    value: valueProp,
    defaultValue,
    onChange,
    placeholder,
    label,
    helperText,
    type = "text",
    min,
    step,
    disabled = false,
    error = false,
    leadingCheckbox = false,
    checkboxChecked,
    onCheckboxChange,
    checkboxAriaLabel,
    trailingIcon,
    onTrailingClick,
    trailingAriaLabel,
    id: idProp,
    name,
    "aria-label": ariaLabel,
    className = "",
    onFocus,
    onBlur,
  },
  ref
) {
  const generatedId = useId();
  const id = idProp ?? generatedId;
  const isControlled = valueProp !== undefined;
  const [internalValue, setInternalValue] = useState(defaultValue ?? "");
  const [focused, setFocused] = useState(false);
  const [hover, setHover] = useState(false);
  const value = isControlled ? valueProp : internalValue;
  const filled = value.length > 0;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isControlled) setInternalValue(e.target.value);
    onChange?.(e);
  };

  const rootClasses = getRootClasses(disabled, error, filled, focused, hover);
  const inputClasses = getInputClasses(disabled, error);
  const hasActions = leadingCheckbox || trailingIcon != null;
  const hasLabelOrHelper = label != null || helperText != null;

  const inputEl = (
    <input
      ref={ref}
      type={type}
      id={id}
      name={name}
      value={isControlled ? valueProp : undefined}
      defaultValue={!isControlled ? defaultValue : undefined}
      onChange={handleChange}
      onFocus={(e) => {
        setFocused(true);
        onFocus?.(e);
      }}
      onBlur={(e) => {
        setFocused(false);
        onBlur?.(e);
      }}
      placeholder={placeholder}
      min={min}
      step={step}
      disabled={disabled}
      aria-label={label == null ? ariaLabel : undefined}
      aria-invalid={error ? true : undefined}
      className={inputClasses}
    />
  );

  const fieldContent = hasActions ? (
    <div
      className={`flex min-w-0 items-center ${GAP}`.trim()}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {leadingCheckbox && (
        <Checkbox
          checked={checkboxChecked}
          onChange={onCheckboxChange}
          disabled={disabled}
          error={error}
          aria-label={checkboxAriaLabel ?? "Toggle"}
          className="shrink-0"
        />
      )}
      <div className="min-w-0 flex-1">
        <div className={rootClasses}>{inputEl}</div>
      </div>
      {trailingIcon != null && trailingAriaLabel != null && (
        <IconButton
          name={trailingIcon}
          size="large"
          variant={leadingCheckbox ? "transparent" : "default"}
          tone={!leadingCheckbox && error ? "error" : "default"}
          disabled={disabled}
          onClick={onTrailingClick}
          aria-label={trailingAriaLabel}
          className="shrink-0"
        />
      )}
    </div>
  ) : (
    <div
      className={`${rootClasses} ${className}`.trim()}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {inputEl}
    </div>
  );

  if (hasLabelOrHelper) {
    return (
      <div className={`flex min-w-0 flex-col gap-3 ${className}`.trim()}>
        {label != null && (
          <label
            htmlFor={id}
            className="font-bold text-grey-950 text-[length:var(--font-size-paragraph-sm)] leading-[1.43]"
          >
            {label}
          </label>
        )}
        {fieldContent}
        {helperText != null && (
          <p className="font-medium text-grey-800 text-[length:var(--font-size-paragraph-sm)] leading-[1.43]">
            {helperText}
          </p>
        )}
      </div>
    );
  }

  return hasActions ? <div className={className}>{fieldContent}</div> : fieldContent;
});
