"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/Icon";
import { Avatar } from "@/components/Avatar";

import type { VideoThumbnailCardProps } from "./types";

function formatViewCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}k`;
  return String(n);
}

const TEXT_SHADOW =
  "0px 0px 1px rgba(0,0,0,0.98), 0px 1px 1px rgba(0,0,0,0.85), 0px 2px 2px rgba(0,0,0,0.5), 0px 3px 2px rgba(0,0,0,0.15), 0px 5px 2px rgba(0,0,0,0.02)";

export function VideoThumbnailCard({
  thumbnailUrl,
  viewCount,
  creatorAvatarUrl,
  creatorName,
  onClick,
  className = "",
}: VideoThumbnailCardProps) {
  const [imageError, setImageError] = useState(false);
  useEffect(() => setImageError(false), [thumbnailUrl]);
  const showPlaceholder = !thumbnailUrl || imageError;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative aspect-4/5 w-full overflow-hidden rounded-[2px] bg-slate-100 transition-transform duration-(--duration-press) ease-(--ease-spring) active:scale-[0.97] ${className}`}
    >
      {showPlaceholder ? (
        <div className="flex h-full w-full items-center justify-center">
          <Icon name="videocam" size={32} className="text-grey-400" fill={0} />
        </div>
      ) : (
        <img
          src={thumbnailUrl}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          onError={() => setImageError(true)}
        />
      )}

      {/* Centered play button */}
      <div className="absolute left-1/2 top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-slate-100 shadow-[0px_0px_10px_0px_rgba(0,0,0,0.12)]">
        <Icon name="play_circle" size={20} className="text-slate-900" />
      </div>

      {/* Top-right: view count */}
      <div className="absolute right-2 top-2 flex items-center gap-1">
        <Icon name="play_circle" size={20} className="text-slate-100" />
        <span
          className="whitespace-nowrap font-semibold leading-(--line-height-paragraph-sm) text-slate-100 text-paragraph-sm"
          style={{ textShadow: TEXT_SHADOW }}
        >
          {formatViewCount(viewCount)} views
        </span>
      </div>

      {/* Bottom-left: optional creator info */}
      {creatorName && (
        <div className="absolute bottom-2 left-2 flex items-center gap-1">
          <Avatar
            src={creatorAvatarUrl ?? null}
            size={16}
            alt={creatorName}
          />
          <span
            className="whitespace-nowrap font-medium leading-(--line-height-paragraph-sm) text-slate-100 text-paragraph-sm"
            style={{ textShadow: TEXT_SHADOW }}
          >
            {creatorName}
          </span>
        </div>
      )}
    </button>
  );
}
