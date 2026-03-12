"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ContextTopBar } from "@/components/ContextTopBar";
import { BottomNav } from "@/components/BottomNav";
import { Dropdown } from "@/components/Dropdown";
import { Icon } from "@/components/Icon";
import { useAuth } from "@/hooks/useAuth";
import {
  getCollectionItems,
  getPost,
  removePostFromCollection,
} from "@/lib/firestore";
import type { Post } from "@/lib/schemas/post";
import { ROUTES } from "@/lib/routes";
import { getDoc, doc, getFirestore } from "firebase/firestore";
import { firebaseApp } from "@/lib/firebase";

const db = getFirestore(firebaseApp);

type SavedPost = Post & { collectionItemPostId: string };

export default function CollectionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const collectionId = params.id as string;

  const [collectionName, setCollectionName] = useState("");
  const [posts, setPosts] = useState<SavedPost[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!collectionId || !user) return;
    setLoading(true);
    try {
      const colSnap = await getDoc(
        doc(db, "save_collections", collectionId),
      );
      if (colSnap.exists()) {
        setCollectionName((colSnap.data() as { name: string }).name);
      }

      const items = await getCollectionItems(collectionId, 200);
      const resolved = await Promise.all(
        items.map(async (item) => {
          const post = await getPost(item.postId);
          return post
            ? { ...post, collectionItemPostId: item.postId }
            : null;
        }),
      );
      setPosts(
        resolved.filter((p): p is SavedPost => p !== null),
      );
    } catch {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [collectionId, user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRemove = useCallback(
    async (postId: string) => {
      if (!user || !collectionId) return;
      setPosts((prev) =>
        prev.filter((p) => p.collectionItemPostId !== postId),
      );
      try {
        await removePostFromCollection(postId, collectionId, user.uid);
      } catch {
        loadData();
      }
    },
    [user, collectionId, loadData],
  );

  const pagePaddingBottom =
    "pb-[max(7.5rem,env(safe-area-inset-bottom)+5rem)]";

  if (loading) {
    return (
      <div
        className={`mx-auto flex min-h-dvh w-full max-w-[440px] flex-col border-x border-slate-200 bg-white ${pagePaddingBottom}`}
      >
        <ContextTopBar
          backLabel="Collections"
          title="..."
          onBack={() => router.push(ROUTES.profileCollections)}
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
        backLabel="Collections"
        title={collectionName || "Collection"}
        onBack={() => router.push(ROUTES.profileCollections)}
      />

      <main className="min-h-0 flex-1 overflow-auto">
        {posts.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-16">
            <Icon
              name="bookmark"
              size={48}
              className="text-text-default-placeholder"
            />
            <p className="text-lg font-medium text-text-default-secondary">
              No saved posts
            </p>
            <p className="text-sm text-text-default-placeholder">
              Save posts from the feed to see them here
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-0.5">
            {posts.map((post) => (
              <div
                key={post.id ?? post.collectionItemPostId}
                className="group relative aspect-square overflow-hidden bg-slate-100"
              >
                <button
                  type="button"
                  onClick={() =>
                    post.id && router.push(ROUTES.postDetail(post.id))
                  }
                  className="h-full w-full transition-transform duration-(--duration-press) ease-(--ease-spring) active:scale-[0.97]"
                >
                  {post.thumbnailUrl ? (
                    <img
                      src={post.thumbnailUrl}
                      alt={post.caption || "Saved post"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Icon
                        name="videocam"
                        size={24}
                        className="text-text-default-placeholder"
                      />
                    </div>
                  )}
                </button>

                <div className="absolute right-1 top-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <Dropdown
                    variant="toggle"
                    items={[
                      {
                        id: "remove",
                        label: "Remove from collection",
                        icon: "bookmark_remove",
                        tone: "error",
                      },
                    ]}
                    onSelect={() =>
                      handleRemove(post.collectionItemPostId)
                    }
                    aria-label="Post actions"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <BottomNav activeItem="profile" />
    </div>
  );
}
