"use client";

import { Avatar } from "@/components/Avatar";
import { ImageBlock } from "@/components/ImageBlock";

import type { ProductListingProps } from "./types";

export function ProductListing({
  imageSrc,
  imageAlt = "",
  badge,
  conditionLabel = "Condition:",
  conditionValue,
  title,
  price,
  originalPrice,
  sellerAvatarSrc,
  sellerName,
  onLike,
  contentPosition = "below",
  trailingContent,
  onClick,
  className = "",
}: ProductListingProps) {
  const isRight = contentPosition === "right";

  const contentPanel = (
    <div
      className={
        isRight
          ? "flex min-w-0 flex-1 flex-col gap-6 bg-white p-4"
          : "flex h-[209px] flex-col gap-6 bg-white p-4"
      }
    >
      <div className="flex min-h-0 flex-1 flex-col gap-4">
        <div className="flex flex-col justify-center gap-1">
          {badge != null && badge !== "" && (
            <span className="font-bold leading-[1.33] text-grey-950 text-[length:var(--font-size-caption)]">
              {badge}
            </span>
          )}
          {conditionValue != null && conditionValue !== "" && (
            <div className="flex items-center gap-1">
              <span className="font-medium leading-[1.43] text-grey-500 text-[length:var(--font-size-paragraph-sm)]">
                {conditionLabel}
              </span>
              <span className="font-semibold leading-[1.43] text-grey-800 text-[length:var(--font-size-paragraph-sm)]">
                {conditionValue}
              </span>
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <h3 className="font-bold leading-[1.5] text-lime-600 text-[length:var(--font-size-paragraph-md)]">
            {title}
          </h3>
          <div className="flex items-center gap-3">
            <span className="font-semibold leading-[1.5] text-lime-700 text-[length:var(--font-size-paragraph-md)]">
              {price}
            </span>
            {originalPrice != null && originalPrice !== "" && (
              <span className="font-semibold leading-[1.5] text-grey-500 text-[length:var(--font-size-paragraph-md)] line-through">
                {originalPrice}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="mt-auto flex flex-col gap-2">
        <Avatar
          size={16}
          src={sellerAvatarSrc ?? undefined}
          alt={sellerName}
          label={sellerName}
          labelPosition="right"
        />
        {trailingContent != null ? trailingContent : null}
      </div>
    </div>
  );

  return (
    <article
      className={`flex shrink-0 min-w-0 ${isRight ? "flex-row items-stretch" : "w-full max-w-[218px] flex-col"} ${onClick ? "cursor-pointer" : ""} ${className}`}
      style={isRight ? undefined : undefined}
      onClick={onClick}
      role={onClick ? "link" : undefined}
    >
      <ImageBlock
        size="large"
        src={imageSrc}
        alt={imageAlt}
        onAction={onLike}
        rounded={false}
      />
      {contentPanel}
    </article>
  );
}
