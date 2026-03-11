"use client";

import { Icon } from "@/components/Icon";

import {
  IMAGE_BLOCK_DIMENSIONS,
  IMAGE_BLOCK_RADIUS,
  type ImageBlockProps,
} from "./types";

export function ImageBlock({
  src,
  alt = "",
  size = "medium",
  onAdd,
  onAction,
  rounded = true,
  className = "",
}: ImageBlockProps) {
  const { width, height } = IMAGE_BLOCK_DIMENSIONS[size];
  const radius = rounded ? IMAGE_BLOCK_RADIUS[size] : 0;
  const isLarge = size === "large";
  const hasImage = Boolean(src);
  const showAddIcon = !hasImage && onAdd;
  const showActionButton = isLarge && onAction;

  const style: React.CSSProperties = isLarge
    ? {
        width: "100%",
        maxWidth: width,
        aspectRatio: "1",
        height: "auto",
        borderRadius: radius,
        backgroundImage:
          "linear-gradient(45deg, #e5e7eb 25%, transparent 25%), linear-gradient(-45deg, #e5e7eb 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e5e7eb 75%), linear-gradient(-45deg, transparent 75%, #e5e7eb 75%)",
        backgroundSize: "20px 20px",
        backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
        backgroundColor: "#f3f4f6",
      }
    : {
        width,
        height,
        borderRadius: radius,
        backgroundImage:
          "linear-gradient(45deg, #e5e7eb 25%, transparent 25%), linear-gradient(-45deg, #e5e7eb 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e5e7eb 75%), linear-gradient(-45deg, transparent 75%, #e5e7eb 75%)",
        backgroundSize: "20px 20px",
        backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
        backgroundColor: "#f3f4f6",
      };

  const root = (
    <div
      className={`relative flex shrink-0 flex-col items-center justify-center overflow-hidden ${className}`}
      style={style}
      role={showAddIcon ? "button" : undefined}
      tabIndex={showAddIcon ? 0 : undefined}
      onClick={showAddIcon ? onAdd : undefined}
      onKeyDown={
        showAddIcon
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onAdd?.();
              }
            }
          : undefined
      }
      aria-label={showAddIcon ? "Add image" : hasImage ? alt || "Image" : undefined}
    >
      {hasImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src!}
          alt={alt}
          className="h-full w-full object-cover"
        />
      ) : showAddIcon ? (
        <Icon
          name={size === "small" ? "photo" : "add_photo_alternate"}
          size={24}
          className="text-grey-500"
          fill={0}
        />
      ) : null}

      {showActionButton && (
        <button
          type="button"
          className="absolute right-6 top-6 flex h-10 w-10 items-center justify-center rounded-full bg-white text-grey-950 shadow-sm transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-1"
          onClick={(e) => {
            e.stopPropagation();
            onAction?.();
          }}
          aria-label="Like"
        >
          <Icon name="favorite" size={20} fill={0} />
        </button>
      )}
    </div>
  );

  return root;
}
