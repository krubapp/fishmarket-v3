"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Drawer } from "@/components/Drawer";
import { DrawerTopBar } from "@/components/DrawerTopBar";
import { Avatar } from "@/components/Avatar";
import { Icon } from "@/components/Icon";
import { Dropdown } from "@/components/Dropdown";
import {
  addComment,
  getPostComments,
  deleteComment,
  getUserProfile,
} from "@/lib/firestore";
import type { UserProfile } from "@/lib/firestore";
import type { PostComment } from "@/lib/schemas/post";
import { useAuth } from "@/hooks/useAuth";
import type { CommentDrawerProps } from "./types";

function relativeTime(ts?: { seconds: number; nanoseconds: number }): string {
  if (!ts) return "now";
  const diff = Math.floor(Date.now() / 1000 - ts.seconds);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}

export function CommentDrawer({
  open,
  onClose,
  postId,
  commentCount,
  onCommentCountChange,
}: CommentDrawerProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<PostComment[]>([]);
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const userCache = useRef<Map<string, UserProfile | null>>(new Map());
  const [userProfiles, setUserProfiles] = useState<
    Map<string, UserProfile | null>
  >(new Map());
  const inputRef = useRef<HTMLInputElement>(null);

  const resolveProfiles = useCallback(
    async (postComments: PostComment[]) => {
      const uids = [
        ...new Set(postComments.map((c) => c.userId).filter(Boolean)),
      ];
      const missing = uids.filter((uid) => !userCache.current.has(uid));

      if (missing.length > 0) {
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
      }

      setUserProfiles(new Map(userCache.current));
    },
    [],
  );

  useEffect(() => {
    if (!open || !postId) {
      setComments([]);
      setText("");
      return;
    }

    let cancelled = false;
    setLoading(true);

    getPostComments(postId)
      .then(async (result) => {
        if (cancelled) return;
        setComments(result);
        await resolveProfiles(result);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, postId, resolveProfiles]);

  const handleSubmit = useCallback(async () => {
    if (!user || !postId || !text.trim() || submitting) return;

    const commentText = text.trim();
    setText("");
    setSubmitting(true);

    try {
      const commentId = await addComment(postId, user.uid, commentText);

      const newComment: PostComment = {
        id: commentId,
        postId,
        userId: user.uid,
        text: commentText,
        createdAt: { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 },
      };

      setComments((prev) => [newComment, ...prev]);
      onCommentCountChange(postId, 1);

      if (!userCache.current.has(user.uid)) {
        const profile = await getUserProfile(user.uid).catch(() => null);
        userCache.current.set(user.uid, profile);
        setUserProfiles(new Map(userCache.current));
      }
    } catch {
      setText(commentText);
    } finally {
      setSubmitting(false);
      inputRef.current?.focus();
    }
  }, [user, postId, text, submitting, onCommentCountChange]);

  const handleDelete = useCallback(
    async (commentId: string) => {
      if (!postId || !commentId) return;

      setComments((prev) => prev.filter((c) => c.id !== commentId));
      onCommentCountChange(postId, -1);

      try {
        await deleteComment(commentId, postId);
      } catch {
        // Re-fetch on error to restore consistency
        getPostComments(postId).then(setComments);
      }
    },
    [postId, onCommentCountChange],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit],
  );

  return (
    <Drawer
      open={open}
      onClose={onClose}
      width={440}
      aria-label="Comments"
    >
      <div className="-mx-6 -mt-4 -mb-4 flex min-h-full flex-col">
        <DrawerTopBar
          title={`Comments (${commentCount})`}
          onBack={onClose}
        />

        <div className="flex flex-1 flex-col overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900" />
            </div>
          ) : comments.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 py-16">
              <Icon
                name="chat_bubble"
                size={32}
                className="text-text-default-placeholder"
              />
              <p className="text-sm font-medium text-text-default-secondary">
                No comments yet
              </p>
              <p className="text-xs text-text-default-placeholder">
                Be the first to comment
              </p>
            </div>
          ) : (
            <div className="flex flex-col">
              {comments.map((comment) => {
                const profile = userProfiles.get(comment.userId);
                const isOwn = user?.uid === comment.userId;

                return (
                  <div
                    key={comment.id}
                    className="flex gap-3 border-b border-slate-100 px-6 py-4"
                  >
                    <Avatar
                      src={profile?.avatarUrl ?? null}
                      alt={
                        profile?.displayName ?? profile?.username ?? "User"
                      }
                      size={32}
                    />
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-semibold text-text-default-headings">
                          {profile?.displayName ??
                            profile?.username ??
                            "User"}
                        </span>
                        <span className="shrink-0 text-xs text-text-default-placeholder">
                          {relativeTime(comment.createdAt)}
                        </span>
                      </div>
                      <p className="whitespace-pre-wrap text-sm leading-relaxed text-text-default-body">
                        {comment.text}
                      </p>
                    </div>
                    {isOwn && comment.id && (
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
                              handleDelete(comment.id);
                            }
                          }}
                          aria-label="Comment actions"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="sticky -bottom-4 shrink-0 flex items-center gap-3 border-t border-slate-200 bg-white px-6 py-3">
          <Avatar
            src={user ? undefined : null}
            size={32}
          />
          <div className="flex flex-1 items-center gap-2 rounded-full border border-slate-300 bg-surface-default px-4 py-2">
            <input
              ref={inputRef}
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Add a comment..."
              disabled={submitting}
              className="min-w-0 flex-1 bg-transparent text-sm text-text-default-body placeholder:text-text-default-placeholder focus:outline-none disabled:opacity-50"
            />
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!text.trim() || submitting}
              className="shrink-0 text-icons-primary-default transition-[color,transform] duration-(--duration-press) ease-(--ease-spring) active:scale-[0.85] disabled:text-text-default-placeholder disabled:active:scale-100"
              aria-label="Send comment"
            >
              <Icon name="send" size={20} />
            </button>
          </div>
        </div>
      </div>
    </Drawer>
  );
}
