"use client";

import { Icon } from "@/components/Icon";
import { useCallback, useId, useRef, useState } from "react";

import type { MediaDropzoneProps } from "./types";

export function MediaDropzone({
  title = "Select images ",
  subtitle = "You can only add up to 10 images / videos",
  onFilesSelect,
  accept = "image/*,video/*",
  maxFiles = 10,
  error = false,
  disabled = false,
  className = "",
  children,
}: MediaDropzoneProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const handleSelect = useCallback(
    (files: FileList | null) => {
      if (!files?.length || !onFilesSelect) return;
      const list = Array.from(files).slice(0, maxFiles);
      onFilesSelect(list);
    },
    [onFilesSelect, maxFiles]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleSelect(e.target.files);
      e.target.value = "";
    },
    [handleSelect]
  );

  const handleClick = useCallback(() => {
    if (disabled) return;
    inputRef.current?.click();
  }, [disabled]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (disabled) return;
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        inputRef.current?.click();
      }
    },
    [disabled]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      if (disabled) return;
      handleSelect(e.dataTransfer.files);
    },
    [disabled, handleSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsDragOver(false);
  }, []);

  const showPlaceholder = !children;
  const isHover = isDragOver && !disabled;

  return (
    <div className={`flex flex-col ${className}`}>
      <input
        id={inputId}
        ref={inputRef}
        type="file"
        accept={accept}
        multiple
        disabled={disabled}
        onChange={handleChange}
        className="sr-only"
        aria-label={title}
        tabIndex={-1}
      />
      <div
        role="button"
        tabIndex={disabled ? undefined : 0}
        aria-pressed={false}
        aria-invalid={error}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`flex min-h-[265px] flex-col justify-center gap-2.5 rounded px-6 py-6 outline-none transition-colors ${
          disabled
            ? "cursor-not-allowed opacity-60"
            : "cursor-pointer"
        } ${
          error
            ? "border border-red-300 bg-red-100"
            : isHover
              ? "border border-slate-500 bg-slate-200"
              : isFocused
                ? "border-2 border-[var(--color-text-default-headings)] bg-white"
                : "border border-slate-400 bg-white"
        }`}
      >
        {showPlaceholder ? (
          <div className="flex flex-1 flex-row items-center gap-6">
            <Icon
              name="add_photo_alternate"
              size={42}
              className={
                error
                  ? "text-red-800"
                  : isHover
                    ? "text-slate-950"
                    : "text-grey-950"
              }
            />
            <div className="flex flex-1 flex-col gap-1">
              <span
                className={`font-medium leading-[1.4] text-[length:var(--font-size-paragraph-lg)] ${
                  error ? "text-red-800" : "text-grey-950"
                }`}
              >
                {title}
              </span>
              <span
                className={`font-medium leading-[1.43] text-[length:var(--font-size-paragraph-sm)] ${
                  error ? "text-red-800" : "text-grey-900"
                }`}
              >
                {subtitle}
              </span>
            </div>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}
