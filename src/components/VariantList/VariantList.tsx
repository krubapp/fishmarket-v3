"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { Icon } from "@/components/Icon";
import { Button } from "@/components/Button";

import type { VariantValue } from "@/lib/schemas/listing";
import type { VariantListProps } from "./types";

/**
 * VariantList (Figma: node 443:1585).
 *
 * Displays variant groups as collapsible sections — each group has a header
 * row (name + value count + chevron) followed by value rows with image,
 * price, and available inputs.
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
          variant="subtle"
          type="button"
          onClick={onOpenDrawer}
          leadingIcon="add"
        >
          Add variants
        </Button>
      </div>
    );
  }

  return (
    <div className="-mx-6 flex flex-col">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Header row */}
      <div className="flex h-14 items-center gap-3 border-b border-t border-slate-200 bg-slate-100 px-6">
        <button
          type="button"
          onClick={toggleExpandAll}
          className="flex flex-1 items-center gap-1"
        >
          <span className="font-semibold text-slate-900 text-paragraph-sm">
            Variant
          </span>
          <span className="text-grey-500 text-paragraph-sm">-</span>
          <span className="text-grey-500 text-paragraph-sm underline">
            {allExpanded ? "Collapse all" : "Expand all"}
          </span>
        </button>
        <span className="w-[92px] text-center font-semibold text-slate-900 text-paragraph-sm">
          Price
        </span>
        <span className="w-[92px] text-center font-semibold text-slate-900 text-paragraph-sm underline">
          Available
        </span>
      </div>

      {/* Group sections */}
      {groupsWithValues.map((group) => {
        const isExpanded = expandedGroups.has(group.id);
        const valueCount = group.values.length;

        return (
          <div key={group.id}>
            {/* Group header */}
            <button
              type="button"
              onClick={() => toggleExpandGroup(group.id)}
              className="flex w-full items-center gap-3 border-b border-slate-200 px-6 py-2"
            >
              <div className="flex min-w-0 flex-1 flex-col items-start">
                <span className="font-semibold text-slate-900 text-paragraph-sm">
                  {group.name}
                </span>
                <span className="text-grey-500 text-caption">
                  {valueCount} {valueCount === 1 ? "value" : "values"}
                </span>
              </div>
              <span
                className="inline-flex transition-transform duration-(--duration-normal) ease-(--ease-out)"
                style={{ transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)" }}
              >
                <Icon
                  name="keyboard_arrow_down"
                  size={20}
                  className="text-grey-500"
                />
              </span>
            </button>

            {/* Value rows */}
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
                    className="flex items-center gap-5 border-b border-slate-200 px-6 py-2"
                  >
                    <button
                      type="button"
                      onClick={() => handleImageClick(value.id)}
                      className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded bg-grey-200"
                    >
                      {imageSrc ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={imageSrc}
                          alt={value.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Icon
                          name="add_photo_alternate"
                          size={20}
                          className="text-grey-500"
                        />
                      )}
                    </button>

                    <span className="min-w-0 flex-1 font-semibold text-slate-900 text-paragraph-sm">
                      {value.name}
                    </span>

                    <input
                      type="number"
                      min={0}
                      value={value.price || ""}
                      onChange={(e) =>
                        updateValue(group.id, value.id, {
                          price: Number(e.target.value) || 0,
                        })
                      }
                      placeholder="0"
                      className="h-9 w-[92px] rounded border border-slate-300 px-2 text-center text-slate-900 text-paragraph-sm outline-none focus:border-slate-900"
                    />

                    <input
                      type="number"
                      min={0}
                      value={value.available || ""}
                      onChange={(e) =>
                        updateValue(group.id, value.id, {
                          available: Number(e.target.value) || 0,
                        })
                      }
                      placeholder="0"
                      className="h-9 w-[92px] rounded border border-slate-300 px-2 text-center text-slate-900 text-paragraph-sm outline-none focus:border-slate-900"
                    />
                  </div>
                );
              })}
              </div>
            </div>
          </div>
        );
      })}

      {/* Add variants button */}
      <div className="p-6">
        <Button
          variant="subtle"
          type="button"
          onClick={onOpenDrawer}
        >
          Add variants
        </Button>
      </div>
    </div>
  );
}
