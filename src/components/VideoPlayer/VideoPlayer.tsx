"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { Icon } from "@/components/Icon";
import type { VideoPlayerProps } from "./types";

export function VideoPlayer({
  src,
  poster,
  autoPlay = true,
  visibilityThreshold = 0.5,
  onPlayChange,
  className = "",
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [muted, setMuted] = useState(false);

  const updatePlaying = useCallback(
    (next: boolean) => {
      onPlayChange?.(next);
    },
    [onPlayChange],
  );

  // Intersection Observer for auto-play/pause
  useEffect(() => {
    if (!autoPlay) return;
    const video = videoRef.current;
    const container = containerRef.current;
    if (!video || !container) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video
            .play()
            .then(() => updatePlaying(true))
            .catch(() => {
              // Browser may block unmuted autoplay; fallback to muted so video still plays
              video.muted = true;
              setMuted(true);
              video.play().then(() => updatePlaying(true)).catch(() => {});
            });
        } else {
          video.pause();
          updatePlaying(false);
        }
      },
      { threshold: visibilityThreshold },
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, [autoPlay, visibilityThreshold, updatePlaying]);

  const toggleMute = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative h-full w-full overflow-hidden bg-black ${className}`}
      onClick={() => toggleMute()}
    >
      <video
        ref={videoRef}
        src={src || undefined}
        poster={poster || undefined}
        muted={muted}
        loop
        playsInline
        preload="metadata"
        className="h-full w-full object-cover"
      />

      {/* Mute toggle */}
      <button
        type="button"
        onClick={toggleMute}
        className="absolute bottom-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 transition-transform duration-(--duration-press) ease-(--ease-spring) active:scale-[0.9]"
        aria-label={muted ? "Unmute" : "Mute"}
      >
        <Icon
          name={muted ? "volume_off" : "volume_up"}
          size={18}
          fill={1}
          className="text-white"
        />
      </button>
    </div>
  );
}
