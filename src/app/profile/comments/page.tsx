"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/Avatar";
import { BottomNav } from "@/components/BottomNav";
import { ContextTopBar } from "@/components/ContextTopBar";
import { Dropdown } from "@/components/Dropdown";
import { Icon } from "@/components/Icon";
import { Skeleton } from "@/components/Skeleton";
import { useAuth } from "@/hooks/useAuth";
import {
  getUserComments,
  deleteComment,
  getPost,
  getUserProfiles,
  type UserProfile,
} from "@/lib/firestore";
import type { PostComment, Post } from "@/lib/schemas/post";
import { ROUTES } from "@/lib/routes";

function relativeTime(ts?: { seconds: number; nanoseconds: number }): string {
  if (!ts) return "now";
  const diff = Math.floor(Date.now() / 1000 - ts.seconds);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}

type CommentWithContext = PostComment & {
  post: Post | null;
  postAuthor: UserProfile | null;
};

export default function ProfileCommentsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [comments, setComments] = useState<CommentWithContext[]>([]);
  const [loading, setLoading] = useState(true);

  const loadComments = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const raw = await getUserComments(user.uid);

      const uniquePostIds = [...new Set(raw.map((c) => c.postId))];
      const posts = await Promise.all(uniquePostIds.map((id) => getPost(id)));
      const postMap = new Map<string, Post | null>();
      uniquePostIds.forEach((id, i) => postMap.set(id, posts[i] ?? null));

      const authorIds = [
        ...new Set(
          posts
            .filter((p): p is Post => p !== null)
            .map((p) => p.userId),
        ),
      ];
      const authorProfiles =
        authorIds.length > 0 ? await getUserProfiles(authorIds) : new Map<string, UserProfile>();

      const withContext: CommentWithContext[] = raw.map((c) => {
        const post = postMap.get(c.postId) ?? null;
        return {
          ...c,
          post,
          postAuthor: post ? authorProfiles.get(post.userId) ?? null : null,
        };
      });

      setComments(withContext);
    } catch (err) {
      console.error("Failed to load comments:", err);
      setComments([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  const handleDelete = useCallback(
    async (commentId: string, postId: string) => {
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      try {
        await deleteComment(commentId, postId);
      } catch {
        loadComments();
      }
    },
    [loadComments],
  );

  const pagePaddingBottom =
    "pb-[max(7.5rem,env(safe-area-inset-bottom)+5rem)]";

  return (
    <div
      className={`mx-auto flex min-h-dvh w-full max-w-[480px] flex-col border-x border-slate-200 bg-white ${pagePaddingBottom}`}
    >
      <ContextTopBar
        backLabel="Profile"
        title="Comments"
        onBack={() => router.push(ROUTES.profile)}
      />

      <main className="min-h-0 flex-1 overflow-auto">
        {loading ? (
          <div className="flex flex-col">
            {Array.from({ length: 4 }, (_, i) => (
              <div
                key={i}
                className="flex gap-3 border-b border-slate-100 px-6 py-4"
              >
                <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
                <div className="flex flex-1 flex-col gap-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : comments.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-16">
            <Icon
              name="chat"
              size={48}
              className="text-grey-400"
              fill={0}
            />
            <p className="text-center font-medium text-grey-700 text-paragraph-md">
              No comments yet
            </p>
            <p className="text-center text-grey-600 text-paragraph-sm">
              Your comments on posts will appear here.
            </p>
          </div>
        ) : (
          <div className="flex flex-col">
            {comments.map((comment) => (
              <div
                key={comment.id}
                className="flex gap-3 border-b border-slate-100 px-6 py-4"
              >
                <Avatar
                  src={comment.postAuthor?.avatarUrl ?? null}
                  alt={
                    comment.postAuthor?.displayName ??
                    comment.postAuthor?.username ??
                    "User"
                  }
                  size={32}
                />
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  {comment.post && (
                    <button
                      type="button"
                      onClick={() =>
                        comment.post?.id &&
                        router.push(ROUTES.postDetail(comment.post.id))
                      }
                      className="truncate text-left text-sm font-semibold text-text-default-headings transition-colors hover:text-slate-600"
                    >
                      {comment.post.caption || "Untitled post"}
                    </button>
                  )}
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-text-default-body">
                    {comment.text}
                  </p>
                  <span className="text-xs text-text-default-placeholder">
                    {relativeTime(comment.createdAt)}
                  </span>
                </div>
                {comment.id && (
                  <div className="shrink-0">
                    <Dropdown
                      variant="toggle"
                      items={[
                        {
                          id: "delete",
                          label: "Delete",
                          icon: "delete",
                          tone: "error",
                        },
                      ]}
                      onSelect={(id) => {
                        if (id === "delete" && comment.id) {
                          handleDelete(comment.id, comment.postId);
                        }
                      }}
                      aria-label="Comment actions"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      <BottomNav activeItem="profile" />
    </div>
  );
}
