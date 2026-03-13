"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "@/components/Icon";
import { Button } from "@/components/Button";

import type { VariantValue } from "@/lib/schemas/listing";
import type { VariantListProps } from "./types";

/**
 * VariantList (Figma: node 443:1585).
 *
 * Table display of variant groups: header (Variant – Expand all, Price, Available),
 * group rows with checkbox, placeholder, name, "X variants ^", and indented value
 * rows with checkbox, image, name, price/available inputs. Add button at bottom.
 */
export function VariantList({
  groups,
  onGroupsChange,
  onOpenDrawer,
  variantImageFiles,
  onVariantImageSelect,
}: VariantListProps) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    () => new Set(groups.map((g) => g.id)),
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingValueId, setPendingValueId] = useState<string | null>(null);

  const groupsWithValues = useMemo(
    () => groups.filter((g) => g.values.length > 0),
    [groups],
  );

  const groupIdsKey = useMemo(
    () => groupsWithValues.map((g) => g.id).join(","),
    [groupsWithValues],
  );

  useEffect(() => {
    if (groupsWithValues.length === 0) return;
    setExpandedGroups(new Set(groupsWithValues.map((g) => g.id)));
  }, [groupIdsKey]);

  const allExpanded =
    groupsWithValues.length > 0 &&
    groupsWithValues.every((g) => expandedGroups.has(g.id));

  const toggleExpandAll = useCallback(() => {
    if (allExpanded) {
      setExpandedGroups(new Set());
    } else {
      setExpandedGroups(new Set(groupsWithValues.map((g) => g.id)));
    }
  }, [groupsWithValues, allExpanded]);

  const toggleExpandGroup = useCallback((groupId: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) next.delete(groupId);
      else next.add(groupId);
      return next;
    });
  }, []);

  const updateValue = useCallback(
    (groupId: string, valueId: string, patch: Partial<VariantValue>) => {
      onGroupsChange(
        groups.map((g) =>
          g.id === groupId
            ? {
                ...g,
                values: g.values.map((v) =>
                  v.id === valueId ? { ...v, ...patch } : v,
                ),
              }
            : g,
        ),
      );
    },
    [groups, onGroupsChange],
  );

  const handleImageClick = useCallback((valueId: string) => {
    setPendingValueId(valueId);
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && pendingValueId) {
        onVariantImageSelect(pendingValueId, file);
      }
      setPendingValueId(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    [pendingValueId, onVariantImageSelect],
  );

  const getImageSrc = useCallback(
    (value: VariantValue) => {
      const localFile = variantImageFiles.get(value.id);
      if (localFile) return URL.createObjectURL(localFile);
      return value.imageUrl ?? null;
    },
    [variantImageFiles],
  );

  if (groupsWithValues.length === 0) {
    return (
      <div>
        <Button
          variant="default"
          size="large"
          type="button"
          onClick={onOpenDrawer}
          leadingIcon="add"
        >
          Add
        </Button>
      </div>
    );
  }

  const cellBorder = "border-b border-slate-200";
  const colPrice = "w-[92px] shrink-0";
  const colAvailable = "w-[92px] shrink-0";
  const colWeight = "w-[80px] shrink-0";

  return (
    <div className="-mx-6 flex flex-col border border-slate-200 bg-white">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="overflow-x-auto">
        <div className="min-w-max">
          {/* Table header */}
          <div
            className={`flex h-14 items-center gap-3 px-6 ${cellBorder} bg-slate-100`}
          >
        <button
          type="button"
          onClick={toggleExpandAll}
          className="flex flex-1 items-center gap-2"
        >
          <span
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded border-2 border-slate-400 bg-white"
            aria-hidden
          >
            {allExpanded ? (
              <Icon name="check" size={16} className="text-slate-900" />
            ) : null}
          </span>
          <span className="font-semibold text-slate-900 text-paragraph-sm">
            Variant –
          </span>
          <span className="text-grey-500 text-paragraph-sm underline">
            {allExpanded ? "Collapse all" : "Expand all"}
          </span>
        </button>
        <span
          className={`text-center font-semibold text-slate-900 text-paragraph-sm ${colPrice}`}
        >
          Price
        </span>
        <span
          className={`text-center font-semibold text-slate-900 text-paragraph-sm ${colWeight}`}
        >
          Weight (g)
        </span>
        <span
          className={`text-center font-semibold text-slate-900 text-paragraph-sm underline ${colAvailable}`}
        >
          Available
        </span>
      </div>

      {/* Group and value rows */}
      {groupsWithValues.map((group) => {
        const isExpanded = expandedGroups.has(group.id);
        const valueCount = group.values.length;

        return (
          <div key={group.id}>
            {/* Group row */}
            <button
              type="button"
              onClick={() => toggleExpandGroup(group.id)}
              className={`flex w-full items-center gap-3 px-6 py-3 ${cellBorder} bg-white text-left`}
            >
              <span
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded border-2 border-slate-400 bg-white"
                aria-hidden
              />
              <div
                className="h-10 w-10 shrink-0 rounded bg-slate-200"
                style={{
                  backgroundImage: `linear-gradient(45deg, #e2e8f0 25%, transparent 25%), linear-gradient(-45deg, #e2e8f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e2e8f0 75%), linear-gradient(-45deg, transparent 75%, #e2e8f0 75%)`,
                  backgroundSize: "8px 8px",
                  backgroundPosition: "0 0, 0 4px, 4px -4px, -4px 0",
                }}
              />
              <div className="flex min-w-0 flex-1 flex-col items-start">
                <span className="block font-semibold text-slate-900 text-paragraph-sm">
                  {group.name}
                </span>
                <span className="block text-grey-500 text-caption">
                  {valueCount} {valueCount === 1 ? "variant" : "variants"}{" "}
                  <span
                    className="inline-flex transition-transform duration-(--duration-normal) ease-(--ease-out)"
                    style={{
                      transform: isExpanded ? "rotate(0deg)" : "rotate(-90deg)",
                    }}
                    aria-hidden
                  >
                    ^
                  </span>
                </span>
              </div>
              <span className={colPrice} />
              <span className={colWeight} />
              <span className={colAvailable} />
            </button>

            {/* Value rows (indented) */}
            <div
              className="grid transition-[grid-template-rows] duration-(--duration-normal) ease-(--ease-out)"
              style={{ gridTemplateRows: isExpanded ? "1fr" : "0fr" }}
            >
              <div className="overflow-hidden">
                {group.values.map((value) => {
                  const imageSrc = getImageSrc(value);
                  return (
                    <div
                      key={value.id}
                      className={`flex items-center gap-3 border-b border-slate-200 bg-white pl-14 pr-6 py-2`}
                    >
                      <span
                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded border-2 border-slate-400 bg-white"
                        aria-hidden
                      />
                      <button
                        type="button"
                        onClick={() => handleImageClick(value.id)}
                        className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded bg-slate-200"
                        style={
                          !imageSrc
                            ? {
                                backgroundImage: `linear-gradient(45deg, #e2e8f0 25%, transparent 25%), linear-gradient(-45deg, #e2e8f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e2e8f0 75%), linear-gradient(-45deg, transparent 75%, #e2e8f0 75%)`,
                                backgroundSize: "8px 8px",
                                backgroundPosition:
                                  "0 0, 0 4px, 4px -4px, -4px 0",
                              }
                            : undefined
                        }
                      >
                        {imageSrc ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={imageSrc}
                            alt={value.name}
                            className="h-full w-full object-cover"
                          />
                        ) : null}
                      </button>
                      <span className="min-w-0 flex-1 font-semibold text-slate-900 text-paragraph-sm">
                        {value.name}
                      </span>
                      <input
                        type="number"
                        min={0}
                        step={0.01}
                        value={value.price ?? ""}
                        onChange={(e) =>
                          updateValue(group.id, value.id, {
                            price: Number(e.target.value) || 0,
                          })
                        }
                        placeholder="0.00"
                        className={`h-9 rounded border border-slate-300 px-2 text-center text-slate-900 text-paragraph-sm outline-none focus:border-slate-900 ${colPrice}`}
                      />
                      <input
                        type="number"
                        min={0}
                        step={1}
                        value={value.weight ?? ""}
                        onChange={(e) => {
                          const v = e.target.value;
                          updateValue(group.id, value.id, {
                            weight: v === "" ? undefined : Number(v) || 0,
                          });
                        }}
                        placeholder="0"
                        title="Weight in grams"
                        className={`h-9 rounded border border-slate-300 px-2 text-center text-slate-900 text-paragraph-sm outline-none focus:border-slate-900 ${colWeight}`}
                      />
                      <input
                        type="number"
                        min={0}
                        value={value.available ?? ""}
                        onChange={(e) =>
                          updateValue(group.id, value.id, {
                            available: Number(e.target.value) || 0,
                          })
                        }
                        placeholder="0"
                        className={`h-9 rounded border border-slate-300 px-2 text-center text-slate-900 text-paragraph-sm outline-none focus:border-slate-900 ${colAvailable}`}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
        </div>
      </div>

      {/* Add button */}
      <div className="border-t border-slate-200 p-6">
        <Button
          variant="default"
          size="large"
          type="button"
          onClick={onOpenDrawer}
          leadingIcon="add"
        >
          Add
        </Button>
      </div>
    </div>
  );
}
