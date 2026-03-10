"use client";

import { useCallback, useEffect, useState } from "react";
import { Drawer } from "@/components/Drawer";
import { DrawerTopBar } from "@/components/DrawerTopBar";
import { IconButton } from "@/components/IconButton";
import { Button } from "@/components/Button";
import { Dropdown } from "@/components/Dropdown";
import { SectionLine } from "@/components/SectionLine";
import { Icon } from "@/components/Icon";

import type { VariantDrawerProps } from "./types";
import type { VariantGroup, VariantValue } from "@/lib/schemas/listing";

const QUICK_SELECTS = ["Color", "Size", "Material", "Weight"] as const;

const GROUP_MENU_ITEMS = [
  { id: "delete", label: "Delete group", icon: "delete" as const },
  { id: "rename", label: "Rename group", icon: "edit" as const },
];

let nextId = 0;
function generateId(prefix = "vg") {
  return `${prefix}_${Date.now()}_${nextId++}`;
}

/**
 * Variant drawer (Figma: variant headers flow, node 410:10870).
 *
 * Two-phase flow: overview (groups + add-group form) and focused view
 * (single group: add-options form only, back to overview).
 */
export function VariantDrawer({
  open,
  onClose,
  groups,
  onGroupsChange,
}: VariantDrawerProps) {
  const [focusedGroupId, setFocusedGroupId] = useState<string | null>(null);
  const [expandedGroupId, setExpandedGroupId] = useState<string | null>(null);
  const [newGroupName, setNewGroupName] = useState("");
  const [newValueInput, setNewValueInput] = useState("");
  const [activeQuickSelect, setActiveQuickSelect] = useState<string | null>(
    null,
  );
  const [renamingGroupId, setRenamingGroupId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  useEffect(() => {
    if (open) setFocusedGroupId(null);
  }, [open]);

  const goToOverview = useCallback(() => {
    setFocusedGroupId(null);
    setExpandedGroupId(null);
    setNewValueInput("");
  }, []);

  const handleCreateGroup = useCallback(() => {
    const name = newGroupName.trim();
    if (!name) return;
    const newGroup: VariantGroup = { id: generateId(), name, values: [] };
    onGroupsChange([...groups, newGroup]);
    setNewGroupName("");
    setActiveQuickSelect(null);
    setNewValueInput("");
    setFocusedGroupId(newGroup.id);
  }, [newGroupName, groups, onGroupsChange]);

  const activeGroupId = focusedGroupId ?? expandedGroupId;

  const handleAddValue = useCallback(() => {
    const name = newValueInput.trim();
    if (!name || !activeGroupId) return;
    const newValue: VariantValue = {
      id: generateId("vv"),
      name,
      price: 0,
      available: 0,
    };
    onGroupsChange(
      groups.map((g) =>
        g.id === activeGroupId
          ? { ...g, values: [...g.values, newValue] }
          : g,
      ),
    );
    setNewValueInput("");
  }, [newValueInput, activeGroupId, groups, onGroupsChange]);

  const handleRemoveValue = useCallback(
    (groupId: string, valueId: string) => {
      onGroupsChange(
        groups.map((g) =>
          g.id === groupId
            ? { ...g, values: g.values.filter((v) => v.id !== valueId) }
            : g,
        ),
      );
    },
    [groups, onGroupsChange],
  );

  const handleDeleteGroup = useCallback(
    (groupId: string) => {
      onGroupsChange(groups.filter((g) => g.id !== groupId));
      if (expandedGroupId === groupId) setExpandedGroupId(null);
      if (focusedGroupId === groupId) goToOverview();
    },
    [groups, onGroupsChange, expandedGroupId, focusedGroupId, goToOverview],
  );

  const handleStartRename = useCallback(
    (groupId: string) => {
      const group = groups.find((g) => g.id === groupId);
      if (!group) return;
      setRenamingGroupId(groupId);
      setRenameValue(group.name);
    },
    [groups],
  );

  const handleFinishRename = useCallback(() => {
    if (!renamingGroupId) return;
    const name = renameValue.trim();
    if (name) {
      onGroupsChange(
        groups.map((g) =>
          g.id === renamingGroupId ? { ...g, name } : g,
        ),
      );
    }
    setRenamingGroupId(null);
    setRenameValue("");
  }, [renamingGroupId, renameValue, groups, onGroupsChange]);

  const handleQuickSelect = useCallback((name: string) => {
    setNewGroupName(name);
    setActiveQuickSelect(name);
  }, []);

  const handleGroupMenuAction = useCallback(
    (groupId: string, actionId: string) => {
      if (actionId === "delete") handleDeleteGroup(groupId);
      else if (actionId === "rename") handleStartRename(groupId);
    },
    [handleDeleteGroup, handleStartRename],
  );

  const toggleGroup = useCallback((groupId: string) => {
    setExpandedGroupId((prev) => (prev === groupId ? null : groupId));
    setNewValueInput("");
  }, []);

  const focusedGroup = focusedGroupId
    ? groups.find((g) => g.id === focusedGroupId)
    : null;
  const isFocusedView = focusedGroupId !== null;

  return (
    <Drawer open={open} onClose={onClose} width={440} aria-label="Variants">
      {isFocusedView && focusedGroup ? (
        <>
          <DrawerTopBar
            title={focusedGroup.name}
            onBack={goToOverview}
            backAriaLabel="Back to variant groups"
            className="-mx-6 -mt-4"
          />
          <div className="flex flex-col gap-6 px-6 py-6">
            {/* Existing values */}
            {focusedGroup.values.map((value) => (
              <div key={value.id} className="flex items-center gap-4">
                <div className="flex h-10 flex-1 items-center rounded-lg border border-dashed border-[#101828] bg-white px-3">
                  <span className="flex-1 text-[#101828] text-paragraph-md leading-normal">
                    {value.name}
                  </span>
                </div>
                <IconButton
                  name="close"
                  size="large"
                  variant="transparent"
                  aria-label={`Remove ${value.name}`}
                  onClick={() =>
                    handleRemoveValue(focusedGroup.id, value.id)
                  }
                />
              </div>
            ))}

            {/* New value input */}
            <div className="flex items-center gap-4">
              <div className="flex h-10 flex-1 items-center rounded-lg border border-slate-400 bg-white px-3">
                <input
                  value={newValueInput}
                  onChange={(e) => setNewValueInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddValue();
                    }
                  }}
                  placeholder={
                    focusedGroup.values.length === 0
                      ? "Red, Blue, Green"
                      : "Add value"
                  }
                  className="w-full bg-transparent text-[#101828] text-paragraph-md leading-normal outline-none placeholder:text-[#8b9189]"
                  aria-label="New variant value"
                />
              </div>
              <IconButton
                name="add"
                size="large"
                variant={newValueInput.trim() ? "default" : "subtle"}
                disabled={!newValueInput.trim()}
                aria-label="Add value"
                onClick={handleAddValue}
                className={
                  !newValueInput.trim() ? "bg-[#cbd4c9]! text-white!" : ""
                }
              />
            </div>
          </div>
        </>
      ) : (
        <>
          <DrawerTopBar
            title="Variants"
            onBack={onClose}
            className="-mx-6 -mt-4"
          />

          {/* Overview: existing groups as accordions */}
          {groups.map((group, groupIndex) => {
            const isExpanded = expandedGroupId === group.id;
            const isRenaming = renamingGroupId === group.id;
            const hasValues = group.values.length > 0;

            return (
              <div key={group.id} className="-mx-6">
                {groupIndex > 0 && <SectionLine />}

                <div className="border-b border-slate-200 px-6 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex items-start gap-1 text-paragraph-lg leading-[1.4]">
                        {isRenaming ? (
                          <input
                            value={renameValue}
                            onChange={(e) => setRenameValue(e.target.value)}
                            onBlur={handleFinishRename}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleFinishRename();
                              if (e.key === "Escape") {
                                setRenamingGroupId(null);
                                setRenameValue("");
                              }
                            }}
                            autoFocus
                            className="min-w-0 flex-1 border-b border-slate-400 bg-transparent font-semibold text-[#121412] outline-none"
                          />
                        ) : (
                          <span className="min-w-0 flex-1 font-semibold text-[#121412]">
                            {group.name}
                          </span>
                        )}
                      </div>
                      {hasValues && (
                        <span className="font-semibold text-[#525651] text-paragraph-sm leading-[1.43]">
                          {group.values.length}{" "}
                          {group.values.length === 1 ? "Item" : "Items"}
                        </span>
                      )}
                    </div>

                    {hasValues && (
                      <Dropdown
                        variant="toggle"
                        items={GROUP_MENU_ITEMS}
                        onSelect={(id) => handleGroupMenuAction(group.id, id)}
                        aria-label={`${group.name} options`}
                      />
                    )}

                    <button
                      type="button"
                      onClick={() => toggleGroup(group.id)}
                      className="flex shrink-0 items-center justify-center"
                      aria-label={isExpanded ? "Collapse" : "Expand"}
                    >
                      <span
                        className="inline-flex transition-transform duration-(--duration-normal) ease-(--ease-out)"
                        style={{
                          transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
                        }}
                      >
                        <Icon
                          name="chevron_right"
                          size={24}
                          className="text-slate-900"
                        />
                      </span>
                    </button>
                  </div>
                </div>

                {/* Expanded: values list + Add options (go to focused view) */}
                <div
                  className="grid transition-[grid-template-rows] duration-(--duration-normal) ease-(--ease-out)"
                  style={{ gridTemplateRows: isExpanded ? "1fr" : "0fr" }}
                >
                  <div className="overflow-hidden">
                    <div className="flex flex-col gap-6 border-b border-slate-200 px-6 py-6">
                      {group.values.map((value) => (
                        <div
                          key={value.id}
                          className="flex h-10 items-center rounded-lg border border-dashed border-[#101828] bg-white px-3"
                        >
                          <span className="text-[#101828] text-paragraph-md leading-normal">
                            {value.name}
                          </span>
                        </div>
                      ))}
                      <Button
                        size="small"
                        variant="subtle"
                        leadingIcon="add"
                        onClick={() => setFocusedGroupId(group.id)}
                      >
                        Add options
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {groups.length > 0 && <SectionLine />}

          {/* New group creation form */}
          <div className="-mx-6 flex flex-col gap-6 border-b border-slate-200 px-6 py-6">
            <div className="flex flex-col gap-2">
              <div className="flex min-h-[40px] items-start gap-1 text-paragraph-lg leading-[1.4]">
                <span className="w-[137px] shrink-0 font-bold text-[#373a36]">
                  Variant group:
                </span>
                <span className="min-w-0 flex-1 font-semibold text-[#121412]">
                  Name
                </span>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex h-10 flex-1 items-center rounded-lg border border-slate-400 bg-white px-3">
                  <input
                    value={newGroupName}
                    onChange={(e) => {
                      setNewGroupName(e.target.value);
                      setActiveQuickSelect(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleCreateGroup();
                      }
                    }}
                    placeholder="Color, Size, Create custom variant name"
                    className="w-full bg-transparent text-[#101828] text-paragraph-md leading-normal outline-none placeholder:text-[#8b9189]"
                    aria-label="Variant group name"
                  />
                </div>
                <IconButton
                  name="add"
                  size="large"
                  variant={newGroupName.trim() ? "default" : "subtle"}
                  disabled={!newGroupName.trim()}
                  aria-label="Create variant group"
                  onClick={handleCreateGroup}
                  className={
                    !newGroupName.trim() ? "bg-[#cbd4c9]! text-white!" : ""
                  }
                />
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <span className="font-medium text-[#373a36] text-caption leading-[1.33]">
                Quick Select
              </span>
              <div className="flex gap-3">
                {QUICK_SELECTS.map((name) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => handleQuickSelect(name)}
                    className={`flex h-6 items-center justify-center rounded-[4px] border border-dashed px-2 py-1 font-medium text-caption leading-[1.33] transition-colors ${
                      activeQuickSelect === name
                        ? "border-[#6a7282] bg-[#dcedff] text-[#012437]"
                        : "border-slate-400 bg-slate-100 text-[#101828] hover:bg-slate-200"
                    }`}
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </Drawer>
  );
}
