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
  coverFrameColor,
  hashtags,
  taggedProducts,
  taggedUsers,
  allowComments = true,
  onHashtagPress,
  onProductPress,
  onTaggedUserPress,
  className = "",
}: FeedCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [productsExpanded, setProductsExpanded] = useState(false);

  const handleCaptionToggle = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded((prev) => !prev);
  }, []);

  const truncatedCaption =
    caption.length > 80 && !expanded
      ? caption.slice(0, 80) + "..."
      : caption;

  const hasProducts = taggedProducts && taggedProducts.length > 0;
  const hasTaggedUsers = taggedUsers && taggedUsers.length > 0;

  return (
    <div
      className={`relative h-dvh w-full snap-start snap-always ${className}`}
      style={{
        borderColor: coverFrameColor ?? "transparent",
        borderWidth: coverFrameColor ? 3 : 0,
        borderStyle: "solid",
      }}
    >
      {/* Video background */}
      <VideoPlayer src={videoUrl} poster={thumbnailUrl} />

      {/* Bottom gradient scrim for readability */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-72 bg-linear-to-t from-black/70 to-transparent" />

      {/* Tagged products pill */}
      {hasProducts && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setProductsExpanded((prev) => !prev);
          }}
          className="absolute left-4 top-16 z-10 flex items-center gap-1.5 rounded-full bg-black/50 px-3 py-1.5 backdrop-blur-sm transition-transform duration-(--duration-press) ease-(--ease-spring) active:scale-[0.95]"
        >
          <Icon
            name="shopping_bag"
            size={16}
            className="text-white"
          />
          <span className="text-xs font-semibold text-white">
            {taggedProducts!.length} {taggedProducts!.length === 1 ? "product" : "products"}
          </span>
        </button>
      )}

      {/* Expanded tagged products panel */}
      {hasProducts && productsExpanded && (
        <div className="absolute left-4 right-16 top-28 z-10 flex gap-3 overflow-x-auto rounded-xl bg-black/60 p-3 backdrop-blur-md">
          {taggedProducts!.map((product) => (
            <button
              key={product.id}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onProductPress?.(product.id);
              }}
              className="flex shrink-0 items-center gap-2.5 rounded-lg bg-white/10 p-2 transition-colors hover:bg-white/20"
            >
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.title}
                  className="h-10 w-10 rounded object-cover"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded bg-white/10">
                  <Icon name="image" size={18} className="text-white/50" />
                </div>
              )}
              <div className="flex flex-col items-start gap-0.5">
                <span className="max-w-[120px] truncate text-xs font-semibold text-white">
                  {product.title}
                </span>
                <span className="text-xs text-white/70">
                  {product.price}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Bottom-left: user info + caption + hashtags */}
      <div className="absolute bottom-6 left-4 right-20 z-10 flex flex-col gap-3">
        {/* Post author */}
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

        {/* Tagged users */}
        {hasTaggedUsers && (
          <div className="flex flex-wrap items-center gap-1.5">
            <Icon name="person" size={14} className="text-white/60" />
            {taggedUsers!.map((tu) => (
              <button
                key={tu.id}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onTaggedUserPress?.(tu.id);
                }}
                className="flex items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 transition-colors hover:bg-white/25"
              >
                <Avatar src={tu.avatarUrl} size={16} alt={tu.displayName} />
                <span className="text-xs font-medium text-white/90">
                  @{tu.displayName}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Caption + hashtags */}
        {(caption || (hashtags && hashtags.length > 0)) && (
          <div>
            {caption && (
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
            )}
            {hashtags && hashtags.length > 0 && (
              <p className="mt-1 flex flex-wrap gap-x-1.5 gap-y-0.5 text-sm drop-shadow-md">
                {hashtags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onHashtagPress?.(tag);
                    }}
                    className="font-semibold text-blue-300 transition-colors hover:text-blue-200"
                  >
                    {tag.startsWith("#") ? tag : `#${tag}`}
                  </button>
                ))}
              </p>
            )}
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
        {allowComments && (
          <ActionButton
            icon="chat_bubble"
            count={commentCount}
            onClick={onComment}
            label="Comments"
          />
        )}
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
