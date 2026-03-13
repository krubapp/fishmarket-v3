"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ContextTopBar } from "@/components/ContextTopBar";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/Button";
import { Icon } from "@/components/Icon";
import { Input } from "@/components/Input";
import { Dropdown } from "@/components/Dropdown";
import { useAuth } from "@/hooks/useAuth";
import {
  getUserCollections,
  createSaveCollection,
  updateSaveCollection,
  deleteSaveCollection,
  getCollectionItems,
  getPost,
} from "@/lib/firestore";
import type { SaveCollection } from "@/lib/schemas/collection";
import type { Post } from "@/lib/schemas/post";
import { ROUTES } from "@/lib/routes";

type CollectionWithCover = SaveCollection & {
  postCount: number;
  coverThumbnail?: string | null;
};

export default function ProfileCollectionsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [collections, setCollections] = useState<CollectionWithCover[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const loadCollections = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const cols = await getUserCollections(user.uid);

      const withCovers: CollectionWithCover[] = await Promise.all(
        cols.map(async (col) => {
          const items = await getCollectionItems(col.id!, 1);
          let coverThumbnail: string | null = null;

          if (items.length > 0) {
            const post = await getPost(items[0].postId);
            coverThumbnail = post?.thumbnailUrl ?? null;
          }

          const fullItems = await getCollectionItems(col.id!, 500);

          return {
            ...col,
            postCount: fullItems.length,
            coverThumbnail,
          };
        }),
      );

      setCollections(withCovers);
    } catch {
      setCollections([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
    loadCollections();
  }, [authLoading, loadCollections]);

  const handleCreate = useCallback(async () => {
    if (!user || !newName.trim() || creating) return;
    const name = newName.trim();
    setNewName("");
    setCreating(true);
    try {
      const id = await createSaveCollection(user.uid, name);
      setCollections((prev) => [
        {
          id,
          userId: user.uid,
          name,
          postCount: 0,
          coverThumbnail: null,
          createdAt: { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 },
        },
        ...prev,
      ]);
    } catch {
      setNewName(name);
    } finally {
      setCreating(false);
    }
  }, [user, newName, creating]);

  const handleRename = useCallback(
    async (collectionId: string) => {
      if (!editName.trim()) {
        setEditingId(null);
        return;
      }
      const name = editName.trim();
      try {
        await updateSaveCollection(collectionId, { name });
        setCollections((prev) =>
          prev.map((c) => (c.id === collectionId ? { ...c, name } : c)),
        );
      } catch {
        // keep old name
      }
      setEditingId(null);
    },
    [editName],
  );

  const handleDelete = useCallback(async (collectionId: string) => {
    setCollections((prev) => prev.filter((c) => c.id !== collectionId));
    try {
      await deleteSaveCollection(collectionId);
    } catch {
      // re-fetch on error
      loadCollections();
    }
  }, [loadCollections]);

  const pagePaddingBottom =
    "pb-[max(7.5rem,env(safe-area-inset-bottom)+5rem)]";

  if (authLoading || loading) {
    return (
      <div
        className={`mx-auto flex min-h-dvh w-full max-w-[440px] flex-col border-x border-slate-200 bg-white ${pagePaddingBottom}`}
      >
        <ContextTopBar
          backLabel="Profile"
          title="Collections"
          onBack={() => router.back()}
        />
        <div className="flex flex-1 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
        </div>
        <BottomNav activeItem="profile" />
      </div>
    );
  }

  return (
    <div
      className={`mx-auto flex min-h-dvh w-full max-w-[440px] flex-col border-x border-slate-200 bg-white ${pagePaddingBottom}`}
    >
      <ContextTopBar
        backLabel="Profile"
        title="Collections"
        onBack={() => router.back()}
      />

      {/* Create new collection */}
      <div className="border-b border-slate-200 px-6 py-4">
        <form
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
      </div>

      <main className="min-h-0 flex-1 overflow-auto">
        {collections.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-16">
            <Icon
              name="collections_bookmark"
              size={48}
              className="text-text-default-placeholder"
            />
            <p className="text-lg font-medium text-text-default-secondary">
              No collections yet
            </p>
            <p className="text-sm text-text-default-placeholder">
              Save posts to collections to organize your favorites
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 p-6">
            {collections.map((col) => {
              const colId = col.id!;
              const isEditing = editingId === colId;

              return (
                <div key={colId} className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      router.push(ROUTES.profileCollectionDetail(colId))
                    }
                    className="group relative aspect-square w-full overflow-hidden rounded-xl bg-slate-100 transition-transform duration-(--duration-press) ease-(--ease-spring) active:scale-[0.97]"
                  >
                    {col.coverThumbnail ? (
                      <img
                        src={col.coverThumbnail}
                        alt={col.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Icon
                          name="collections_bookmark"
                          size={32}
                          className="text-text-default-placeholder"
                        />
                      </div>
                    )}
                  </button>

                  <div className="flex items-start justify-between gap-1">
                    <div className="min-w-0 flex-1">
                      {isEditing ? (
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            handleRename(colId);
                          }}
                        >
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            onBlur={() => handleRename(colId)}
                            autoFocus
                            className="w-full rounded border border-slate-300 px-2 py-0.5 text-sm font-semibold text-text-default-headings focus:border-slate-900 focus:outline-none"
                          />
                        </form>
                      ) : (
                        <>
                          <p className="truncate text-sm font-semibold text-text-default-headings">
                            {col.name}
                          </p>
                          <p className="text-xs text-text-default-secondary">
                            {col.postCount}{" "}
                            {col.postCount === 1 ? "post" : "posts"}
                          </p>
                        </>
                      )}
                    </div>
                    <Dropdown
                      variant="toggle"
                      items={[
                        { id: "rename", label: "Rename", icon: "edit" },
                        {
                          id: "delete",
                          label: "Delete",
                          icon: "delete",
                          tone: "error",
                        },
                      ]}
                      onSelect={(id) => {
                        if (id === "rename") {
                          setEditingId(colId);
                          setEditName(col.name);
                        } else if (id === "delete") {
                          handleDelete(colId);
                        }
                      }}
                      aria-label={`Actions for ${col.name}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <BottomNav activeItem="profile" />
    </div>
  );
}
