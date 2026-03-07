"use client";

import { Icon } from "@/components/Icon";

import type { AvatarProps } from "./types";

function AvatarCircle({
  src,
  alt,
  size,
  className,
}: Pick<AvatarProps, "src" | "alt" | "size" | "className">) {
  const style = { width: size, height: size };

  return (
    <span
      className={`inline-flex shrink-0 overflow-hidden rounded-full bg-grey-200 ${className ?? ""}`}
      style={style}
      role="img"
      aria-label={alt || "Avatar"}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt ?? ""}
          className="h-full w-full object-cover"
        />
      ) : (
        <span className="flex h-full w-full items-center justify-center">
          <Icon
            name="person"
            size={Math.round(size * 0.6)}
            className="text-grey-500"
            fill={0}
          />
        </span>
      )}
    </span>
  );
}

const labelClass =
  "font-medium leading-[1.43] text-grey-950 text-[length:var(--font-size-paragraph-sm)]";

export function Avatar({
  src,
  alt = "",
  size = 32,
  label,
  labelPosition = "below",
  className = "",
}: AvatarProps) {
  const circle = (
    <AvatarCircle src={src} alt={alt} size={size} />
  );

  if (label != null && label !== "") {
    const isRight = labelPosition === "right";
    return (
      <div
        className={`flex gap-2 ${isRight ? "flex-row items-center" : "flex-col items-center"} ${className}`}
        role="img"
        aria-label={`${alt || "Avatar"}: ${label}`}
      >
        {circle}
        <span className={isRight ? labelClass : `${labelClass} text-center`}>
          {label}
        </span>
      </div>
    );
  }

  return <span className={className}>{circle}</span>;
}
