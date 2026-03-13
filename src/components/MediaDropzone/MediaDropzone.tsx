"use client";

import { Icon } from "@/components/Icon";
import { IconButton } from "@/components/IconButton";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";

import { convertHeicToJpegFiles } from "@/lib/heic";
import type { MediaDropzoneProps } from "./types";

export function MediaDropzone({
  title = "Select images ",
  subtitle = "You can only add up to 10 images / videos",
  files = [],
  onFilesChange,
  onConversionError,
  accept = "image/*,video/*,.heic,image/heic",
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
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isConverting, setIsConverting] = useState(false);

  const previewUrls = useMemo(
    () => files.map((f) => URL.createObjectURL(f)),
    [files],
  );

  useEffect(() => {
    return () => previewUrls.forEach((url) => URL.revokeObjectURL(url));
  }, [previewUrls]);

  useEffect(() => {
    if (selectedIndex >= files.length) {
      setSelectedIndex(Math.max(0, files.length - 1));
    }
  }, [files.length, selectedIndex]);

  const hasFiles = files.length > 0;
  const hasMultiple = files.length > 1;

  const handleFilesIn = useCallback(
    async (incoming: FileList | null) => {
      if (!incoming?.length || !onFilesChange) return;
      setIsConverting(true);
      try {
        const added = Array.from(incoming);
        const flat: File[] = [];
        const failed: File[] = [];
        for (const f of added) {
          try {
            const converted = await convertHeicToJpegFiles(f);
            flat.push(...converted);
          } catch {
            failed.push(f);
          }
        }
        if (failed.length > 0) {
          onConversionError?.(failed);
        }
        const merged = [...files, ...flat].slice(0, maxFiles);
        onFilesChange(merged);
      } finally {
        setIsConverting(false);
      }
    },
    [onFilesChange, onConversionError, files, maxFiles],
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      void handleFilesIn(e.target.files);
      e.target.value = "";
    },
    [handleFilesIn],
  );

  const handleClick = useCallback(() => {
    if (disabled || isConverting) return;
    inputRef.current?.click();
  }, [disabled, isConverting]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (disabled || isConverting) return;
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        inputRef.current?.click();
      }
    },
    [disabled, isConverting],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      if (disabled || isConverting) return;
      void handleFilesIn(e.dataTransfer.files);
    },
    [disabled, isConverting, handleFilesIn],
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

  const handleDelete = useCallback(() => {
    if (!onFilesChange) return;
    const next = files.filter((_, i) => i !== selectedIndex);
    onFilesChange(next);
  }, [files, selectedIndex, onFilesChange]);

  const handlePrev = useCallback(() => {
    setSelectedIndex((i) => Math.max(0, i - 1));
  }, []);

  const handleNext = useCallback(() => {
    setSelectedIndex((i) => Math.min(files.length - 1, i + 1));
  }, [files.length]);

  const showPlaceholder = !hasFiles && !children;
  const isHover = isDragOver && !disabled && !isConverting;
  const isBusy = disabled || isConverting;

  return (
    <div className={`flex flex-col ${className}`}>
      <input
        id={inputId}
        ref={inputRef}
        type="file"
        accept={accept}
        multiple
        disabled={disabled || isConverting}
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
        className={`relative flex flex-col justify-center gap-2.5 overflow-hidden rounded outline-none transition-[color,background-color,border-color,transform] duration-(--duration-press) ease-(--ease-out) active:scale-[0.99] ${
          hasFiles ? "h-[265px]" : "min-h-[265px]"
        } ${
          showPlaceholder ? "px-6 py-6" : ""
        } ${
          isBusy
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
        {hasFiles ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrls[selectedIndex]}
              alt={files[selectedIndex]?.name ?? "Selected image"}
              className="absolute inset-0 h-full w-full object-cover"
            />

            {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
            <div
              className="absolute inset-0 flex flex-col justify-between p-4 pointer-events-none"
              onClick={(e) => e.stopPropagation()}
              aria-hidden
            >
              {/* Top row: delete */}
              <div className="flex justify-end pointer-events-auto">
                <IconButton
                  name="delete"
                  variant="neutrals"
                  size="large"
                  aria-label="Delete image"
                  onClick={handleDelete}
                />
              </div>

              {/* Middle row: prev / next */}
              {hasMultiple && (
                <div className="flex items-center justify-between pointer-events-auto">
                  <IconButton
                    name="chevron_left"
                    variant="neutrals"
                    size="large"
                    aria-label="Previous image"
                    onClick={handlePrev}
                    disabled={selectedIndex === 0}
                  />
                  <IconButton
                    name="chevron_right"
                    variant="neutrals"
                    size="large"
                    aria-label="Next image"
                    onClick={handleNext}
                    disabled={selectedIndex === files.length - 1}
                  />
                </div>
              )}

              {/* Bottom row: counter */}
              {hasMultiple && (
                <div className="flex justify-center pointer-events-auto">
                  <span className="rounded-full bg-white/90 px-3 py-1 text-[length:var(--font-size-paragraph-sm)] font-medium text-slate-900 shadow-sm">
                    {selectedIndex + 1} / {files.length}
                  </span>
                </div>
              )}
            </div>
          </>
        ) : showPlaceholder ? (
          <div className="relative flex flex-1 flex-row items-center gap-6">
            {isConverting && (
              <div className="absolute inset-0 z-10 flex items-center justify-center rounded bg-white/90">
                <span className="text-paragraph-md font-medium text-slate-700">
                  Converting…
                </span>
              </div>
            )}
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
