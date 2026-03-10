"use client";

import { useState, useCallback } from "react";
import { Icon } from "@/components/Icon";
import { Avatar } from "@/components/Avatar";
import { VideoPlayer } from "@/components/VideoPlayer";
import type { FeedCardProps } from "./types";

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function ActionButton({
  icon,
  count,
  active,
  activeClass,
  onClick,
  label,
}: {
  icon: string;
  count: number;
  active?: boolean;
  activeClass?: string;
  onClick?: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      className="flex flex-col items-center gap-0.5 transition-transform duration-(--duration-press) ease-(--ease-spring) active:scale-[0.85]"
      aria-label={label}
    >
      <Icon
        name={icon as Parameters<typeof Icon>[0]["name"]}
        size={28}
        fill={active ? 1 : 0}
        className={active && activeClass ? activeClass : "text-white"}
      />
      <span className="text-xs font-semibold text-white">
        {formatCount(count)}
      </span>
    </button>
  );
}

export function FeedCard({
  videoUrl,
  thumbnailUrl,
  caption,
  userDisplayName,
  userAvatarUrl,
  likeCount,
  saveCount,
  commentCount,
  liked,
  saved,
  onLike,
  onSave,
  onComment,
  onShare,
  onUserPress,
  className = "",
}: FeedCardProps) {
  const [expanded, setExpanded] = useState(false);

  const handleCaptionToggle = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded((prev) => !prev);
  }, []);

  const truncatedCaption =
    caption.length > 80 && !expanded
      ? caption.slice(0, 80) + "..."
      : caption;

  return (
    <div
      className={`relative h-dvh w-full snap-start snap-always ${className}`}
    >
      {/* Video background */}
      <VideoPlayer src={videoUrl} poster={thumbnailUrl} />

      {/* Bottom gradient scrim for readability */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-72 bg-linear-to-t from-black/70 to-transparent" />

      {/* Bottom-left: user info + caption */}
      <div className="absolute bottom-6 left-4 right-20 z-10 flex flex-col gap-3">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onUserPress?.();
          }}
          className="flex items-center gap-2"
        >
          <Avatar
            src={userAvatarUrl}
            size={32}
            alt={userDisplayName}
          />
          <span className="text-sm font-semibold text-white drop-shadow-md">
            {userDisplayName}
          </span>
        </button>

        {caption && (
          <div>
            <p className="text-sm leading-snug text-white drop-shadow-md">
              {truncatedCaption}
              {caption.length > 80 && (
                <button
                  type="button"
                  onClick={handleCaptionToggle}
                  className="ml-1 font-semibold text-white/80"
                >
                  {expanded ? "less" : "more"}
                </button>
              )}
            </p>
          </div>
        )}
      </div>

      {/* Right-side action column */}
      <div className="absolute bottom-28 right-3 z-10 flex flex-col items-center gap-5">
        <ActionButton
          icon="favorite"
          count={likeCount}
          active={liked}
          activeClass="text-red-500"
          onClick={onLike}
          label={liked ? "Unlike" : "Like"}
        />
        <ActionButton
          icon="bookmark"
          count={saveCount}
          active={saved}
          activeClass="text-yellow-400"
          onClick={onSave}
          label={saved ? "Unsave" : "Save"}
        />
        <ActionButton
          icon="chat_bubble"
          count={commentCount}
          onClick={onComment}
          label="Comments"
        />
        <ActionButton
          icon="send"
          count={0}
          onClick={onShare}
          label="Share"
        />
      </div>
    </div>
  );
}
