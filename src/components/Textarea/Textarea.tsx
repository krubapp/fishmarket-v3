"use client";

import { forwardRef, useId, useState } from "react";

import type { TextareaProps } from "./types";

const MIN_HEIGHT_PX = 160;

function getRootClasses(disabled: boolean, error: boolean, filled: boolean, focused: boolean): string {
  const base =
    "flex min-w-0 rounded-lg border px-3 py-4 transition-colors " +
    "focus-within:border-slate-900 " +
    "placeholder:text-slate-400";
  if (disabled) {
    return `${base} border-slate-200 bg-grey-200 focus-within:border-slate-200`;
  }
  if (error) {
    return `${base} border-red-600 bg-red-100 focus-within:border-red-600`;
  }
  if (focused) {
    return `${base} border-slate-900 bg-white`;
  }
  if (filled) {
    return `${base} border-slate-400 bg-slate-200`;
  }
  return `${base} border-slate-400 bg-white`;
}

function getTextareaClasses(disabled: boolean, error: boolean): string {
  const base =
    "w-full min-w-0 resize-y bg-transparent text-[length:var(--font-size-paragraph-md)] leading-[1.5] outline-none " +
    "text-slate-900 placeholder:text-slate-400";
  if (disabled) return `${base} cursor-not-allowed text-grey-700 placeholder:text-grey-500`;
  if (error) return `${base} text-red-700 placeholder:text-red-400`;
  return base;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  {
    value: valueProp,
    defaultValue,
    onChange,
    placeholder,
    label,
    helperText,
    disabled = false,
    error = false,
    rows = 6,
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
  const value = isControlled ? valueProp : internalValue;
  const filled = value.length > 0;

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!isControlled) setInternalValue(e.target.value);
    onChange?.(e);
  };

  const minHeight = Math.max(MIN_HEIGHT_PX, rows * 24);
  const rootClasses = getRootClasses(disabled, error, filled, focused);
  const textareaClasses = getTextareaClasses(disabled, error);

  const textareaEl = (
    <textarea
      ref={ref}
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
      disabled={disabled}
      rows={rows}
      aria-label={label == null ? ariaLabel : undefined}
      aria-invalid={error ? true : undefined}
      className={textareaClasses}
      style={{ minHeight }}
    />
  );

  if (label != null || helperText != null) {
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
        <div className={rootClasses}>{textareaEl}</div>
        {helperText != null && (
          <p className="font-medium text-grey-800 text-[length:var(--font-size-paragraph-sm)] leading-[1.43]">
            {helperText}
          </p>
        )}
      </div>
    );
  }

  return <div className={`${rootClasses} ${className}`.trim()}>{textareaEl}</div>;
});
