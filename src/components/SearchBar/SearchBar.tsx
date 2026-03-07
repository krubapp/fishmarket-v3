"use client";

import { Icon } from "@/components/Icon";
import { useCallback, useId, useState } from "react";

import type { SearchBarProps, SearchBarResult } from "./types";

function ResultRow({
  result,
  onSelect,
}: {
  result: SearchBarResult;
  onSelect?: (r: SearchBarResult) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect?.(result)}
      className="flex w-full items-center gap-3 border-none bg-transparent p-0 text-left outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-inset"
    >
      <span className="min-w-0 flex-1 truncate font-medium leading-[1.5] text-grey-800 text-[length:var(--font-size-paragraph-md)]">
        {result.title}
      </span>
      <div className="flex shrink-0 items-center gap-2">
        <div className="relative h-4 w-4 overflow-hidden rounded-full bg-grey-200">
          {result.sellerAvatarSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={result.sellerAvatarSrc}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center">
              <Icon name="person" size={12} className="text-grey-500" fill={0} />
            </span>
          )}
        </div>
        <span className="truncate font-medium leading-[1.43] text-grey-500 text-[length:var(--font-size-paragraph-sm)]">
          {result.sellerName}
        </span>
      </div>
    </button>
  );
}

function SearchResultsPanel({
  results,
  onResultSelect,
}: {
  results: SearchBarResult[];
  onResultSelect?: (r: SearchBarResult) => void;
}) {
  return (
    <div
      className="flex flex-col gap-6 border-b border-slate-200 bg-white px-6 py-6 shadow-[0_4px_6px_-1_rgba(0,0,0,0.08)]"
      style={{ borderBottomWidth: 1 }}
      role="listbox"
      aria-label="Search suggestions"
    >
      <span className="font-semibold leading-[1.43] text-grey-500 text-[length:var(--font-size-paragraph-sm)]">
        Top Suggestions
      </span>
      <div className="flex flex-col gap-6">
        {results.map((result) => (
          <ResultRow
            key={result.id}
            result={result}
            onSelect={onResultSelect}
          />
        ))}
      </div>
    </div>
  );
}

export function SearchBar({
  value: controlledValue,
  defaultValue = "",
  placeholder = "Search",
  onValueChange,
  onSubmit,
  onCancel,
  showCancel = true,
  results,
  onResultSelect,
  className = "",
}: SearchBarProps) {
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : uncontrolledValue;

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const next = e.target.value;
      if (!isControlled) setUncontrolledValue(next);
      onValueChange?.(next);
    },
    [isControlled, onValueChange]
  );

  const handleClear = useCallback(() => {
    if (!isControlled) setUncontrolledValue("");
    onValueChange?.("");
  }, [isControlled, onValueChange]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      onSubmit?.(value);
    },
    [onSubmit, value]
  );

  const inputId = useId();
  const hasValue = value.length > 0;
  const showResults = results && results.length > 0;

  return (
    <div className={`relative flex w-full flex-col ${className}`}>
      <form
        className="flex items-center gap-4 border-b border-slate-200 bg-white px-6 py-4"
        style={{ borderBottomWidth: 1 }}
        onSubmit={handleSubmit}
        role="search"
        aria-label="Search"
      >
        <div className="relative flex min-w-0 flex-1 items-center gap-2.5 rounded-lg border border-[#99A1AF] bg-white px-3 py-2.5 focus-within:border-[var(--color-text-default-headings)] focus-within:outline-none focus-within:ring-1 focus-within:ring-[var(--color-text-default-headings)]">
          <Icon
            name="search"
            size={24}
            className="shrink-0 text-grey-500"
            aria-hidden
          />
          <input
            id={inputId}
            type="text"
            value={value}
            onChange={handleChange}
            placeholder={placeholder}
            className="min-w-0 flex-1 border-none bg-transparent text-[length:var(--font-size-paragraph-md)] leading-[1.5] text-[var(--color-text-default-headings)] placeholder:text-grey-500 outline-none"
            autoComplete="off"
            aria-label={placeholder}
            aria-expanded={showResults}
            aria-controls={showResults ? "search-results-panel" : undefined}
            role="searchbox"
          />
          {hasValue && (
            <button
              type="button"
              onClick={handleClear}
              className="flex shrink-0 items-center justify-center rounded-full p-1 text-grey-500 outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              aria-label="Clear search"
            >
              <Icon name="close" size={20} />
            </button>
          )}
        </div>

        {showCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="shrink-0 rounded-full px-3 py-2 font-medium text-[var(--color-text-default-headings)] text-[length:var(--font-size-paragraph-sm)] leading-[1.43] outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
            style={{ minHeight: 32 }}
          >
            Cancel
          </button>
        )}
      </form>

      {showResults && (
        <div id="search-results-panel" className="w-full">
          <SearchResultsPanel
            results={results}
            onResultSelect={onResultSelect}
          />
        </div>
      )}
    </div>
  );
}
