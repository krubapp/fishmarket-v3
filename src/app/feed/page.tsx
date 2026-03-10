"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { FeedCard } from "@/components/FeedCard";
import { Icon } from "@/components/Icon";
import {
  getFeedPosts,
  getUserPostInteractions,
  getUserProfile,
  togglePostLike,
  togglePostSave,
} from "@/lib/firestore";
import type { UserProfile } from "@/lib/firestore";
import type { Post } from "@/lib/schemas/post";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/lib/routes";
import type { DocumentSnapshot } from "firebase/firestore";

const PAGE_SIZE = 6;

type PostWithUser = Post & { user?: UserProfile | null };

export default function FeedPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [posts, setPosts] = useState<PostWithUser[]>([]);
  const [liked, setLiked] = useState<Set<string>>(new Set());
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const lastDocRef = useRef<DocumentSnapshot | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadingMore = useRef(false);

  // Cache of user profiles to avoid re-fetching
  const userCache = useRef<Map<string, UserProfile | null>>(new Map());

  const resolveUsers = useCallback(
    async (feedPosts: Post[]): Promise<PostWithUser[]> => {
      const uniqueIds = [
        ...new Set(feedPosts.map((p) => p.userId).filter(Boolean)),
      ];
      const missing = uniqueIds.filter((id) => !userCache.current.has(id));

      const profiles = await Promise.all(
        missing.map((uid) =>
          getUserProfile(uid)
            .then((p) => ({ uid, profile: p }))
            .catch(() => ({ uid, profile: null })),
        ),
      );
      profiles.forEach(({ uid, profile }) =>
        userCache.current.set(uid, profile),
      );

      return feedPosts.map((p) => ({
        ...p,
        user: userCache.current.get(p.userId) ?? null,
      }));
    },
    [],
  );

  const loadPosts = useCallback(
    async (initial = false) => {
      if (loadingMore.current && !initial) return;
      loadingMore.current = true;

      try {
        const { posts: newPosts, lastDoc } = await getFeedPosts(
          PAGE_SIZE,
          initial ? undefined : (lastDocRef.current ?? undefined),
        );

        if (newPosts.length < PAGE_SIZE) setHasMore(false);
        lastDocRef.current = lastDoc;

        const withUsers = await resolveUsers(newPosts);

        setPosts((prev) => (initial ? withUsers : [...prev, ...withUsers]));

        // Batch-check interactions
        if (user) {
          const ids = newPosts
            .map((p) => p.id)
            .filter((id): id is string => !!id);
          if (ids.length > 0) {
            const interactions = await getUserPostInteractions(ids, user.uid);
            setLiked((prev) => {
              const next = new Set(prev);
              interactions.liked.forEach((id) => next.add(id));
              return next;
            });
            setSaved((prev) => {
              const next = new Set(prev);
              interactions.saved.forEach((id) => next.add(id));
              return next;
            });
          }
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
        loadingMore.current = false;
      }
    },
    [user, resolveUsers],
  );

  // Initial load
  useEffect(() => {
    loadPosts(true);
  }, [loadPosts]);

  // Infinite scroll with Intersection Observer on sentinel
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore && !loadingMore.current) {
          loadPosts();
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loadPosts]);

  const handleLike = useCallback(
    async (postId: string) => {
      if (!user || !postId) return;
      const wasLiked = liked.has(postId);

      // Optimistic update
      setLiked((prev) => {
        const next = new Set(prev);
        wasLiked ? next.delete(postId) : next.add(postId);
        return next;
      });
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, likeCount: p.likeCount + (wasLiked ? -1 : 1) }
            : p,
        ),
      );

      try {
        await togglePostLike(postId, user.uid);
      } catch {
        // Revert on error
        setLiked((prev) => {
          const next = new Set(prev);
          wasLiked ? next.add(postId) : next.delete(postId);
          return next;
        });
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId
              ? { ...p, likeCount: p.likeCount + (wasLiked ? 1 : -1) }
              : p,
          ),
        );
      }
    },
    [user, liked],
  );

  const handleSave = useCallback(
    async (postId: string) => {
      if (!user || !postId) return;
      const wasSaved = saved.has(postId);

      setSaved((prev) => {
        const next = new Set(prev);
        wasSaved ? next.delete(postId) : next.add(postId);
        return next;
      });
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, saveCount: p.saveCount + (wasSaved ? -1 : 1) }
            : p,
        ),
      );

      try {
        await togglePostSave(postId, user.uid);
      } catch {
        setSaved((prev) => {
          const next = new Set(prev);
          wasSaved ? next.add(postId) : next.delete(postId);
          return next;
        });
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId
              ? { ...p, saveCount: p.saveCount + (wasSaved ? 1 : -1) }
              : p,
          ),
        );
      }
    },
    [user, saved],
  );

  if (loading) {
    return (
      <div className="flex h-dvh items-center justify-center bg-black">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/30 border-t-white" />
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="flex h-dvh flex-col items-center justify-center gap-4 bg-black px-8 text-center">
        <Icon name="videocam_off" size={48} className="text-white/40" />
        <p className="text-lg font-medium text-white/70">No posts yet</p>
        <p className="text-sm text-white/50">
          Be the first to share a video!
        </p>
        <button
          type="button"
          onClick={() => router.push(ROUTES.createPost)}
          className="mt-2 rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-black transition-transform duration-(--duration-press) ease-(--ease-spring) active:scale-[0.97]"
        >
          Create Post
        </button>
      </div>
    );
  }

  return (
    <div className="h-dvh snap-y snap-mandatory overflow-y-scroll bg-black">
      {posts.map((post) => (
        <FeedCard
          key={post.id}
          videoUrl={post.videoUrl}
          thumbnailUrl={post.thumbnailUrl}
          caption={post.caption}
          userDisplayName={
            post.user?.displayName || post.user?.username || "Anonymous"
          }
          userAvatarUrl={post.user?.avatarUrl}
          likeCount={post.likeCount}
          saveCount={post.saveCount}
          commentCount={post.commentCount}
          liked={post.id ? liked.has(post.id) : false}
          saved={post.id ? saved.has(post.id) : false}
          onLike={() => post.id && handleLike(post.id)}
          onSave={() => post.id && handleSave(post.id)}
        />
      ))}

      {/* Sentinel for infinite scroll */}
      {hasMore && (
        <div ref={sentinelRef} className="flex h-20 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/30 border-t-white" />
        </div>
      )}
    </div>
  );
}
