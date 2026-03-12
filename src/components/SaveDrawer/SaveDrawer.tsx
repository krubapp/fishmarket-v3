"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Drawer } from "@/components/Drawer";
import { DrawerTopBar } from "@/components/DrawerTopBar";
import { Checkbox } from "@/components/Checkbox";
import { Input } from "@/components/Input";
import { Icon } from "@/components/Icon";
import {
  createSaveCollection,
  getUserCollections,
  getPostCollectionIds,
  savePostToCollection,
  removePostFromCollection,
} from "@/lib/firestore";
import type { SaveCollection } from "@/lib/schemas/collection";
import { useAuth } from "@/hooks/useAuth";
import type { SaveDrawerProps } from "./types";

export function SaveDrawer({
  open,
  onClose,
  postId,
  onSavedChange,
}: SaveDrawerProps) {
  const { user } = useAuth();
  const [collections, setCollections] = useState<SaveCollection[]>([]);
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const initialCheckedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!open || !postId || !user) {
      setCollections([]);
      setCheckedIds(new Set());
      setNewName("");
      return;
    }

    let cancelled = false;
    setLoading(true);

    Promise.all([
      getUserCollections(user.uid),
      getPostCollectionIds(postId, user.uid),
    ])
      .then(([cols, checked]) => {
        if (cancelled) return;
        setCollections(cols);
        setCheckedIds(checked);
        initialCheckedRef.current = new Set(checked);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, postId, user]);

  const handleToggle = useCallback(
    async (collectionId: string, checked: boolean) => {
      if (!postId || !user) return;

      setCheckedIds((prev) => {
        const next = new Set(prev);
        checked ? next.add(collectionId) : next.delete(collectionId);
        return next;
      });

      try {
        if (checked) {
          await savePostToCollection(postId, collectionId, user.uid);
        } else {
          await removePostFromCollection(postId, collectionId, user.uid);
        }

        const wasEmpty = initialCheckedRef.current.size === 0;
        const isNowEmpty = checked
          ? false
          : await getPostCollectionIds(postId, user.uid).then(
              (ids) => ids.size === 0,
            );

        if (wasEmpty && checked) {
          onSavedChange(postId, true);
          initialCheckedRef.current.add(collectionId);
        } else if (isNowEmpty) {
          onSavedChange(postId, false);
          initialCheckedRef.current.clear();
        }
      } catch {
        setCheckedIds((prev) => {
          const next = new Set(prev);
          checked ? next.delete(collectionId) : next.add(collectionId);
          return next;
        });
      }
    },
    [postId, user, onSavedChange],
  );

  const handleCreate = useCallback(async () => {
    if (!user || !newName.trim() || creating) return;

    const name = newName.trim();
    setNewName("");
    setCreating(true);

    try {
      const id = await createSaveCollection(user.uid, name);
      const newCollection: SaveCollection = {
        id,
        userId: user.uid,
        name,
        createdAt: { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 },
      };
      setCollections((prev) => [newCollection, ...prev]);
    } catch {
      setNewName(name);
    } finally {
      setCreating(false);
    }
  }, [user, newName, creating]);

  return (
    <Drawer open={open} onClose={onClose} width={440} aria-label="Save to collection">
      <DrawerTopBar
        title="Save to collection"
        onBack={onClose}
        className="-mx-6 -mt-4"
      />

      {/* Create new collection */}
      <form
        className="-mx-6 border-b border-slate-200 px-6 py-4"
        onSubmit={(e) => {
          e.preventDefault();
          handleCreate();
        }}
      >
        <Input
          placeholder="New collection name..."
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          trailingIcon="add"
          onTrailingClick={handleCreate}
          trailingAriaLabel="Create collection"
          aria-label="New collection name"
          disabled={creating}
        />
      </form>

      {/* Collection list */}
      <div className="-mx-6 flex flex-1 flex-col overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900" />
          </div>
        ) : collections.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 py-16">
            <Icon
              name="collections_bookmark"
              size={32}
              className="text-text-default-placeholder"
            />
            <p className="text-sm font-medium text-text-default-secondary">
              No collections yet
            </p>
            <p className="text-xs text-text-default-placeholder">
              Create your first collection above
            </p>
          </div>
        ) : (
          <div className="flex flex-col">
            {collections.map((col) => {
              const colId = col.id!;
              return (
                <div
                  key={colId}
                  className="flex items-center gap-3 border-b border-slate-100 px-6 py-4"
                >
                  <Checkbox
                    checked={checkedIds.has(colId)}
                    onChange={(checked) => handleToggle(colId, checked)}
                    aria-label={`Save to ${col.name}`}
                  />
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-sm font-semibold text-text-default-headings">
                      {col.name}
                    </span>
                  </div>
                  <Icon
                    name="folder"
                    size={20}
                    className="shrink-0 text-text-default-placeholder"
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Drawer>
  );
}
