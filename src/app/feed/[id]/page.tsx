"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { FeedCard } from "@/components/FeedCard";
import type {
  FeedCardTaggedProduct,
  FeedCardTaggedUser,
} from "@/components/FeedCard";
import { ContextTopBar } from "@/components/ContextTopBar";
import { BottomNav } from "@/components/BottomNav";
import { CommentDrawer } from "@/components/CommentDrawer";
import { SaveDrawer } from "@/components/SaveDrawer";
import {
  getPost,
  getListingsByIds,
  getUserProfile,
  getUserProfiles,
  getUserPostInteractions,
  togglePostLike,
} from "@/lib/firestore";
import type { UserProfile } from "@/lib/firestore";
import type { Listing } from "@/lib/schemas/listing";
import type { Post } from "@/lib/schemas/post";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/lib/routes";

const BOTTOM_NAV_PX = 66;

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const postId = params.id as string;

  const [post, setPost] = useState<Post | null>(null);
  const [author, setAuthor] = useState<UserProfile | null>(null);
  const [taggedUsers, setTaggedUsers] = useState<FeedCardTaggedUser[]>([]);
  const [taggedProducts, setTaggedProducts] = useState<FeedCardTaggedProduct[]>(
    [],
  );
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [commentDrawerOpen, setCommentDrawerOpen] = useState(false);
  const [saveDrawerOpen, setSaveDrawerOpen] = useState(false);

  useEffect(() => {
    if (!postId) return;
    let cancelled = false;
    setLoading(true);
    setNotFound(false);
    getPost(postId)
      .then((p) => {
        if (cancelled) return;
        if (!p) {
          setNotFound(true);
          setPost(null);
          return;
        }
        setPost(p);
        return p;
      })
      .then(async (p) => {
        if (!p || cancelled) return;
        const authorProfile = await getUserProfile(p.userId);
        if (!cancelled) setAuthor(authorProfile ?? null);

        const taggedUserIds = p.taggedUserIds ?? [];
        const taggedListingIds = p.taggedListingIds ?? [];
        const [userMap, listingMap] = await Promise.all([
          taggedUserIds.length > 0
            ? getUserProfiles(taggedUserIds)
            : Promise.resolve(new Map<string, UserProfile>()),
          taggedListingIds.length > 0
            ? getListingsByIds(taggedListingIds)
            : Promise.resolve(new Map<string, Listing>()),
        ]);

        if (cancelled) return;
        const resolvedUsers: FeedCardTaggedUser[] = taggedUserIds
          .map((uid) => {
            const profile = userMap.get(uid);
            if (!profile) return null;
            return {
              id: uid,
              displayName: profile.displayName || profile.username || uid,
              avatarUrl: profile.avatarUrl ?? null,
            };
          })
          .filter((u): u is FeedCardTaggedUser => u != null);
        const resolvedProducts: FeedCardTaggedProduct[] = taggedListingIds
          .map((lid) => {
            const listing = listingMap.get(lid);
            if (!listing) return null;
            return {
              id: lid,
              title: listing.title,
              imageUrl: listing.imageUrls?.[0],
              price: `${listing.currency ?? "SEK"} ${listing.price}`,
            };
          })
          .filter((p): p is FeedCardTaggedProduct => p != null);
        setTaggedUsers(resolvedUsers);
        setTaggedProducts(resolvedProducts);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [postId]);

  useEffect(() => {
    if (!postId || !user?.uid) return;
    getUserPostInteractions([postId], user.uid).then(({ liked: l, saved: s }) => {
      setLiked(l.has(postId));
      setSaved(s.has(postId));
    });
  }, [postId, user?.uid]);

  const handleLike = useCallback(async () => {
    if (!user?.uid || !postId) return;
    const wasLiked = liked;
    setLiked(!wasLiked);
    setPost((prev) =>
      prev
        ? { ...prev, likeCount: prev.likeCount + (wasLiked ? -1 : 1) }
        : null,
    );
    try {
      await togglePostLike(postId, user.uid);
    } catch {
      setLiked(wasLiked);
      setPost((prev) =>
        prev
          ? { ...prev, likeCount: prev.likeCount + (wasLiked ? 1 : -1) }
          : null,
      );
    }
  }, [user?.uid, postId, liked]);

  const handleSavedChange = useCallback((_postId: string, isSaved: boolean) => {
    setSaved(isSaved);
    setPost((prev) =>
      prev
        ? {
            ...prev,
            saveCount: prev.saveCount + (isSaved ? 1 : -1),
          }
        : null,
    );
  }, []);

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
      router.push(ROUTES.profileByUsername(id));
    },
    [router],
  );

  const handleUserPress = useCallback(() => {
    if (author?.username ?? author?.uid) {
      router.push(ROUTES.profileByUsername(author?.username ?? author!.uid));
    }
  }, [author, router]);

  if (loading) {
    return (
      <div className="flex min-h-dvh flex-col bg-black">
        <ContextTopBar
          backLabel="Feed"
          title=""
          onBack={() => router.push(ROUTES.feed)}
        />
        <div className="flex flex-1 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/30 border-t-white" />
        </div>
        <BottomNav activeItem="feed" />
      </div>
    );
  }

  if (notFound || !post) {
    return (
      <div className="flex min-h-dvh flex-col bg-white">
        <ContextTopBar
          backLabel="Feed"
          title="Post"
          onBack={() => router.push(ROUTES.feed)}
        />
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
          <p className="font-medium text-slate-900">Post not found</p>
          <button
            type="button"
            onClick={() => router.push(ROUTES.feed)}
            className="rounded-full bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white transition-transform duration-(--duration-press) ease-(--ease-spring) active:scale-[0.97]"
          >
            Back to Feed
          </button>
        </div>
        <BottomNav activeItem="feed" />
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col bg-black">
      <ContextTopBar
        backLabel="Feed"
        title=""
        onBack={() => router.push(ROUTES.feed)}
      />
      <div className="flex-1 min-h-0">
        <FeedCard
          videoUrl={post.videoUrl}
          thumbnailUrl={post.thumbnailUrl ?? undefined}
          height={`calc(100dvh - 80px - ${BOTTOM_NAV_PX}px - env(safe-area-inset-bottom, 0px))`}
          caption={post.caption}
          userDisplayName={
            author?.displayName || author?.username || "Anonymous"
          }
          userAvatarUrl={author?.avatarUrl ?? undefined}
          likeCount={post.likeCount}
          saveCount={post.saveCount}
          commentCount={post.commentCount}
          liked={liked}
          saved={saved}
          onLike={handleLike}
          onSave={() => setSaveDrawerOpen(true)}
          onComment={() => setCommentDrawerOpen(true)}
          onUserPress={handleUserPress}
          coverFrameColor={post.coverFrameColor}
          hashtags={post.hashtags}
          taggedProducts={taggedProducts}
          taggedUsers={taggedUsers}
          allowComments={post.allowComments}
          onHashtagPress={handleHashtagPress}
          onProductPress={handleProductPress}
          onTaggedUserPress={handleTaggedUserPress}
        />
      </div>

      <CommentDrawer
        open={commentDrawerOpen}
        onClose={() => setCommentDrawerOpen(false)}
        postId={postId}
        commentCount={post.commentCount}
        onCommentCountChange={(_pid, delta) => {
          setPost((prev) =>
            prev ? { ...prev, commentCount: prev.commentCount + delta } : null,
          );
        }}
      />

      <SaveDrawer
        open={saveDrawerOpen}
        onClose={() => setSaveDrawerOpen(false)}
        postId={postId}
        onSavedChange={handleSavedChange}
      />

      <BottomNav activeItem="feed" />
    </div>
  );
}
