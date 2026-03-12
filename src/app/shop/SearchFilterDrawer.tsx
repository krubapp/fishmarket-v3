"use client";

import { useState, useEffect, useCallback } from "react";
import { Drawer } from "@/components/Drawer";
import { IconButton } from "@/components/IconButton";
import { Radio } from "@/components/Radio";
import { Checkbox } from "@/components/Checkbox";
import { ColorBlock } from "@/components/ColorBlock";
import { Button } from "@/components/Button";
import type { ColorBlockColor } from "@/components/ColorBlock";
import type { UserProfile } from "@/lib/firestore";
import { LISTING_CONDITIONS } from "@/lib/schemas/listing";

const CONDITION_LABELS: Record<string, string> = {
  new: "New",
  used: "Used",
  refurbished: "Refurbished",
};

const PRICE_RANGES = [
  { id: "0-50", label: "Under 50 SEK", min: 0, max: 50 },
  { id: "50-100", label: "50 SEK - 100 SEK", min: 50, max: 100 },
  { id: "100-200", label: "100 SEK - 200 SEK", min: 100, max: 200 },
  { id: "200+", label: "200 SEK +", min: 200, max: undefined },
] as const;

const COLORS: { color: ColorBlockColor; label: string }[] = [
  { color: "white", label: "White" },
  { color: "red", label: "Red" },
  { color: "green", label: "Green" },
  { color: "black", label: "Black" },
  { color: "silver", label: "Silver" },
  { color: "yellow", label: "Yellow" },
  { color: "blue", label: "Blue" },
];

export type SearchFilters = {
  condition?: string;
  minPrice?: number;
  maxPrice?: number;
  sellerId?: string;
};

export type SearchFilterDrawerProps = {
  open: boolean;
  onClose: () => void;
  filters: SearchFilters;
  onApply: (filters: SearchFilters) => void;
  sellers: UserProfile[];
};

export function SearchFilterDrawer({
  open,
  onClose,
  filters,
  onApply,
  sellers,
}: SearchFilterDrawerProps) {
  const [draft, setDraft] = useState<SearchFilters>({});

  useEffect(() => {
    if (open) setDraft({ ...filters });
  }, [open, filters]);

  const activeFilterCount = countFilters(draft);

  const handleApply = useCallback(() => {
    onApply(draft);
    onClose();
  }, [draft, onApply, onClose]);

  const handleReset = useCallback(() => {
    setDraft({});
  }, []);

  const selectedPriceId = PRICE_RANGES.find(
    (r) => r.min === draft.minPrice && r.max === draft.maxPrice,
  )?.id;

  return (
    <Drawer open={open} onClose={onClose} aria-label="Filter" width={440}>
      <div className="-mx-6 -mt-6 flex flex-col overflow-y-auto pb-[96px]">
        {/* Header */}
        <div className="flex h-[88px] shrink-0 items-center justify-between px-6">
          <span className="font-medium text-paragraph-lg leading-[1.4] text-text-default-body">
            Filter
          </span>
          <IconButton
            name="close"
            size="large"
            variant="default"
            aria-label="Close filter"
            onClick={onClose}
          />
        </div>

        {/* Condition */}
        <FilterSection title="Condition">
          {LISTING_CONDITIONS.map((c) => (
            <Radio
              key={c}
              name="condition"
              value={c}
              label={CONDITION_LABELS[c] ?? c}
              checked={draft.condition === c}
              onChange={() =>
                setDraft((d) => ({
                  ...d,
                  condition: d.condition === c ? undefined : c,
                }))
              }
            />
          ))}
        </FilterSection>

        {/* Price */}
        <FilterSection title="Price">
          {PRICE_RANGES.map((r) => (
            <Checkbox
              key={r.id}
              label={r.label}
              checked={selectedPriceId === r.id}
              onChange={(checked) =>
                setDraft((d) => ({
                  ...d,
                  minPrice: checked ? r.min : undefined,
                  maxPrice: checked ? r.max : undefined,
                }))
              }
            />
          ))}
        </FilterSection>

        {/* Brands */}
        {sellers.length > 0 && (
          <FilterSection title="Brands">
            {sellers.map((s) => (
              <Checkbox
                key={s.uid}
                label={s.displayName || s.email}
                checked={draft.sellerId === s.uid}
                onChange={(checked) =>
                  setDraft((d) => ({
                    ...d,
                    sellerId: checked ? s.uid : undefined,
                  }))
                }
              />
            ))}
          </FilterSection>
        )}

        {/* Colors (decorative) */}
        <div className="flex flex-col gap-4 p-6">
          <span className="font-semibold text-paragraph-lg leading-[1.4] text-black">
            Colors
          </span>
          <div className="flex flex-wrap gap-1">
            {COLORS.map((c) => (
              <ColorBlock
                key={c.color}
                color={c.color}
                label={c.label}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 flex gap-6 border-t border-slate-200 bg-white px-6 py-6">
        <Button
          variant="subtle"
          size="medium"
          onClick={handleReset}
          disabled={activeFilterCount === 0}
          className="flex-1"
        >
          Reset ({activeFilterCount})
        </Button>
        <Button
          size="medium"
          onClick={handleApply}
          className="flex-1"
        >
          Apply
        </Button>
      </div>
    </Drawer>
  );
}

function FilterSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-slate-200 p-6">
      <span className="font-semibold text-paragraph-lg leading-[1.4] text-black">
        {title}
      </span>
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  );
}

function countFilters(f: SearchFilters): number {
  let n = 0;
  if (f.condition) n++;
  if (f.minPrice != null || f.maxPrice != null) n++;
  if (f.sellerId) n++;
  return n;
}
