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
  {
    id: "delete",
    label: "Delete group",
    icon: "delete" as const,
    tone: "error" as const,
  },
  { id: "rename", label: "Rename group", icon: "edit" as const },
];

let nextId = 0;
function generateId(prefix = "vg") {
  return `${prefix}_${Date.now()}_${nextId++}`;
}

/**
 * Variant drawer (Figma: variant headers flow, node 410:10870).
 *
 * Single view: active group at top (name, options, add-options input, Add group),
 * other groups below as collapsed accordions. No separate create vs edit views.
 */
export function VariantDrawer({
  open,
  onClose,
  groups,
  onGroupsChange,
}: VariantDrawerProps) {
  const [expandedGroupId, setExpandedGroupId] = useState<string | null>(null);
  const [newGroupName, setNewGroupName] = useState("");
  const [newValueInput, setNewValueInput] = useState("");
  const [activeQuickSelect, setActiveQuickSelect] = useState<string | null>(
    null,
  );
  const [renamingGroupId, setRenamingGroupId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  const activeGroup = groups[0] ?? null;
  const otherGroups = groups.slice(1);
  const isPlaceholderActiveGroup =
    activeGroup?.name === "New group" && activeGroup?.values.length === 0;

  useEffect(() => {
    if (open) setExpandedGroupId(null);
  }, [open]);

  const handleCreateGroup = useCallback(() => {
    const name = newGroupName.trim();
    if (!name) return;
    const newGroup: VariantGroup = { id: generateId(), name, values: [] };
    const isPlaceholderActive =
      groups[0]?.name === "New group" && groups[0]?.values.length === 0;
    if (isPlaceholderActive) {
      onGroupsChange([newGroup, ...groups.slice(1)]);
    } else {
      onGroupsChange([newGroup, ...groups]);
    }
    setNewGroupName("");
    setActiveQuickSelect(null);
    setNewValueInput("");
  }, [newGroupName, groups, onGroupsChange]);

  const handleAddNewGroup = useCallback(() => {
    const newGroup: VariantGroup = {
      id: generateId(),
      name: "New group",
      values: [],
    };
    onGroupsChange([newGroup, ...groups]);
    setNewValueInput("");
  }, [groups, onGroupsChange]);

  const handleAddValue = useCallback(() => {
    const name = newValueInput.trim();
    if (!name || !activeGroup) return;
    const newValue: VariantValue = {
      id: generateId("vv"),
      name,
      price: 0,
      available: 0,
    };
    onGroupsChange(
      groups.map((g) =>
        g.id === activeGroup.id
          ? { ...g, values: [...g.values, newValue] }
          : g,
      ),
    );
    setNewValueInput("");
  }, [newValueInput, activeGroup, groups, onGroupsChange]);

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
    },
    [groups, onGroupsChange, expandedGroupId],
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
  }, []);

  const canFinishActiveGroup =
    !activeGroup || activeGroup.values.length >= 2;

  const handleDrawerClose = useCallback(() => {
    if (activeGroup && activeGroup.values.length < 2) {
      onGroupsChange(groups.slice(1));
    }
    onClose();
  }, [activeGroup, groups, onGroupsChange, onClose]);

  return (
    <Drawer
      open={open}
      onClose={handleDrawerClose}
      width={480}
      aria-label="Variants"
    >
      <DrawerTopBar
        title={groups.length === 0 ? "Add variants" : "Variants"}
        onBack={handleDrawerClose}
        backAriaLabel="Back"
        actionLabel={groups.length > 0 ? "Add group" : undefined}
        actionIcon={groups.length > 0 ? "add" : undefined}
        onAction={groups.length > 0 ? handleAddNewGroup : undefined}
        actionDisabled={groups.length > 0 ? !canFinishActiveGroup : undefined}
        className="-mx-6 -mt-4"
      />

      {groups.length === 0 ? (
        /* No groups: show only create form */
        <div className="-mx-6 flex flex-col gap-6 border-b border-slate-200 px-6 py-6">
          <div className="flex flex-col gap-2">
            <p className="font-semibold text-[#121412] text-paragraph-lg leading-[1.4]">
              Name your variant group
            </p>
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
      ) : (
        /* Has groups: active at top (unless placeholder), then accordions, then add-another form */
        <div className="flex flex-col">
          {/* Active group block: only show after user has named next group via bottom form (hide "New group" placeholder) */}
          {!isPlaceholderActiveGroup && (
          <div className="-mx-6 flex flex-col gap-6 px-6 py-6">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="font-semibold text-[#121412] text-paragraph-lg leading-[1.4]">
                  Variant group: {activeGroup.name}
                </span>
                <span className="font-semibold text-[#525651] text-paragraph-sm leading-[1.43]">
                  {activeGroup.values.length}{" "}
                  {activeGroup.values.length === 1 ? "Item" : "Items"}
                </span>
              </div>
              <Dropdown
                variant="toggle"
                items={GROUP_MENU_ITEMS}
                onSelect={(id) => handleGroupMenuAction(activeGroup.id, id)}
                aria-label={`${activeGroup.name} options`}
              />
            </div>

            {activeGroup.values.map((value) => (
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
                    handleRemoveValue(activeGroup.id, value.id)
                  }
                />
              </div>
            ))}

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
                  placeholder={`Variant name for ${activeGroup.name}`}
                  className="w-full bg-transparent text-[#101828] text-paragraph-md leading-normal outline-none placeholder:text-[#8b9189]"
                  aria-label={`Variant name for ${activeGroup.name}`}
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

            <Button
              size="small"
              variant="subtle"
              leadingIcon="add"
              onClick={handleAddNewGroup}
              disabled={!canFinishActiveGroup}
              className="w-fit"
            >
              Add group
            </Button>
          </div>
          )}

          {/* Add next variant group: only when placeholder is active (top form hidden); never show both forms at once */}
          {otherGroups.length > 0 && isPlaceholderActiveGroup && (
          <div className="-mx-6 flex flex-col gap-6 border-t border-slate-200 px-6 py-6">
            <div className="flex flex-col gap-2">
              <p className="font-semibold text-[#121412] text-paragraph-lg leading-[1.4]">
                Add another variant
              </p>
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
          )}

          {/* Other groups as collapsed accordions */}
          {otherGroups.map((group) => {
            const isExpanded = expandedGroupId === group.id;
            const isRenaming = renamingGroupId === group.id;
            const hasValues = group.values.length > 0;

            return (
              <div key={group.id} className="-mx-6 border-t border-slate-200">
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

                    <Dropdown
                      variant="toggle"
                      items={GROUP_MENU_ITEMS}
                      onSelect={(id) => handleGroupMenuAction(group.id, id)}
                      aria-label={`${group.name} options`}
                    />

                    <button
                      type="button"
                      onClick={() => toggleGroup(group.id)}
                      className="flex shrink-0 items-center justify-center"
                      aria-label={isExpanded ? "Collapse" : "Expand"}
                    >
                      <span
                        className="inline-flex transition-transform duration-(--duration-normal) ease-(--ease-out)"
                        style={{
                          transform: isExpanded
                            ? "rotate(90deg)"
                            : "rotate(0deg)",
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

                <div
                  className="grid transition-[grid-template-rows] duration-(--duration-normal) ease-(--ease-out)"
                  style={{ gridTemplateRows: isExpanded ? "1fr" : "0fr" }}
                >
                  <div className="overflow-hidden">
                    <div className="flex flex-col gap-4 border-b border-slate-200 px-6 py-4">
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
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Drawer>
  );
}
