"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { FeedCard } from "@/components/FeedCard";
import type { FeedCardTaggedProduct, FeedCardTaggedUser } from "@/components/FeedCard";
import { CommentDrawer } from "@/components/CommentDrawer";
import { SaveDrawer } from "@/components/SaveDrawer";
import { Icon } from "@/components/Icon";
import {
  getFeedPosts,
  getListingsByIds,
  getUserPostInteractions,
  getUserProfile,
  getUserProfiles,
  togglePostLike,
} from "@/lib/firestore";
import type { UserProfile } from "@/lib/firestore";
import type { Listing } from "@/lib/schemas/listing";
import type { Post } from "@/lib/schemas/post";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/lib/routes";
import type { DocumentSnapshot } from "firebase/firestore";

const PAGE_SIZE = 6;

type ResolvedPost = Post & {
  user?: UserProfile | null;
  resolvedTaggedUsers?: FeedCardTaggedUser[];
  resolvedTaggedProducts?: FeedCardTaggedProduct[];
};

export default function FeedPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [posts, setPosts] = useState<ResolvedPost[]>([]);
  const [liked, setLiked] = useState<Set<string>>(new Set());
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [commentPostId, setCommentPostId] = useState<string | null>(null);
  const [savePostId, setSavePostId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const lastDocRef = useRef<DocumentSnapshot | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadingMore = useRef(false);

  const userCache = useRef<Map<string, UserProfile | null>>(new Map());
  const listingCache = useRef<Map<string, Listing | null>>(new Map());

  const resolvePostData = useCallback(
    async (feedPosts: Post[]): Promise<ResolvedPost[]> => {
      // Collect all user IDs: post authors + tagged users
      const authorIds = feedPosts.map((p) => p.userId).filter(Boolean);
      const taggedUserIds = feedPosts.flatMap((p) => p.taggedUserIds ?? []);
      const allUserIds = [...new Set([...authorIds, ...taggedUserIds])];
      const missingUserIds = allUserIds.filter((id) => !userCache.current.has(id));

      // Collect all tagged listing IDs
      const allListingIds = [
        ...new Set(feedPosts.flatMap((p) => p.taggedListingIds ?? [])),
      ];
      const missingListingIds = allListingIds.filter(
        (id) => !listingCache.current.has(id),
      );

      // Batch-fetch missing users and listings in parallel
      const [userMap, listingMap] = await Promise.all([
        missingUserIds.length > 0
          ? getUserProfiles(missingUserIds)
          : Promise.resolve(new Map<string, UserProfile>()),
        missingListingIds.length > 0
          ? getListingsByIds(missingListingIds)
          : Promise.resolve(new Map<string, Listing>()),
      ]);

      // Also fetch authors individually if not in batch (getUserProfiles uses documentId)
      // Since we already batch all missing via getUserProfiles, just populate the cache
      missingUserIds.forEach((uid) => {
        userCache.current.set(uid, userMap.get(uid) ?? null);
      });
      missingListingIds.forEach((lid) => {
        listingCache.current.set(lid, listingMap.get(lid) ?? null);
      });

      return feedPosts.map((p) => {
        const postUser = userCache.current.get(p.userId) ?? null;

        const resolvedTaggedUsers: FeedCardTaggedUser[] = [];
        for (const uid of p.taggedUserIds ?? []) {
          const profile = userCache.current.get(uid);
          if (profile) {
            resolvedTaggedUsers.push({
              id: uid,
              displayName: profile.displayName || profile.username || uid,
              avatarUrl: profile.avatarUrl ?? null,
            });
          }
        }

        const resolvedTaggedProducts: FeedCardTaggedProduct[] = [];
        for (const lid of p.taggedListingIds ?? []) {
          const listing = listingCache.current.get(lid);
          if (listing) {
            resolvedTaggedProducts.push({
              id: lid,
              title: listing.title,
              imageUrl: listing.imageUrls?.[0],
              price: `${listing.currency ?? "SEK"} ${listing.price}`,
            });
          }
        }

        return {
          ...p,
          user: postUser,
          resolvedTaggedUsers,
          resolvedTaggedProducts,
        };
      });
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

        const withData = await resolvePostData(newPosts);

        setPosts((prev) => (initial ? withData : [...prev, ...withData]));

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
    [user, resolvePostData],
  );

  useEffect(() => {
    loadPosts(true);
  }, [loadPosts]);

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

  const handleSavedChange = useCallback(
    (postId: string, isSaved: boolean) => {
      setSaved((prev) => {
        const next = new Set(prev);
        isSaved ? next.add(postId) : next.delete(postId);
        return next;
      });
      setPosts((prev) =>
        prev.map((p) => {
          if (p.id !== postId) return p;
          const wasSaved = saved.has(postId);
          if (isSaved && !wasSaved) {
            return { ...p, saveCount: p.saveCount + 1 };
          }
          if (!isSaved && wasSaved) {
            return { ...p, saveCount: Math.max(0, p.saveCount - 1) };
          }
          return p;
        }),
      );
    },
    [saved],
  );

  const handleHashtagPress = useCallback(
    (hashtag: string) => {
      const q = hashtag.startsWith("#") ? hashtag.slice(1) : hashtag;
      router.push(`${ROUTES.shop}?q=${encodeURIComponent(q)}`);
    },
    [router],
  );

  const handleProductPress = useCallback(
    (id: string) => {
      router.push(ROUTES.listingDetail(id));
    },
    [router],
  );

  const handleTaggedUserPress = useCallback(
    (id: string) => {
      const profile = userCache.current.get(id);
      const identifier = profile?.username || id;
      router.push(ROUTES.profileByUsername(identifier));
    },
    [router],
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
          onSave={() => post.id && setSavePostId(post.id)}
          onComment={() => post.id && setCommentPostId(post.id)}
          coverFrameColor={post.coverFrameColor}
          hashtags={post.hashtags}
          taggedProducts={post.resolvedTaggedProducts}
          taggedUsers={post.resolvedTaggedUsers}
          allowComments={post.allowComments}
          onHashtagPress={handleHashtagPress}
          onProductPress={handleProductPress}
          onTaggedUserPress={handleTaggedUserPress}
        />
      ))}

      {hasMore && (
        <div ref={sentinelRef} className="flex h-20 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/30 border-t-white" />
        </div>
      )}

      <CommentDrawer
        open={!!commentPostId}
        onClose={() => setCommentPostId(null)}
        postId={commentPostId}
        commentCount={
          posts.find((p) => p.id === commentPostId)?.commentCount ?? 0
        }
        onCommentCountChange={(pid, delta) => {
          setPosts((prev) =>
            prev.map((p) =>
              p.id === pid
                ? { ...p, commentCount: p.commentCount + delta }
                : p,
            ),
          );
        }}
      />

      <SaveDrawer
        open={!!savePostId}
        onClose={() => setSavePostId(null)}
        postId={savePostId}
        onSavedChange={handleSavedChange}
      />
    </div>
  );
}
