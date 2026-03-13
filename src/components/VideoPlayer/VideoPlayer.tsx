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
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [showPlayIcon, setShowPlayIcon] = useState(false);
  const playIconTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);

  const updatePlaying = useCallback(
    (next: boolean) => {
      setPlaying(next);
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
          video.play().then(() => updatePlaying(true)).catch(() => {});
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

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play().then(() => updatePlaying(true)).catch(() => {});
    } else {
      video.pause();
      updatePlaying(false);
    }

    // Flash the play/pause indicator
    setShowPlayIcon(true);
    clearTimeout(playIconTimeout.current);
    playIconTimeout.current = setTimeout(() => setShowPlayIcon(false), 600);
  }, [updatePlaying]);

  const toggleMute = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative h-full w-full overflow-hidden bg-black ${className}`}
      onClick={togglePlay}
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

      {/* Play/Pause flash indicator */}
      <div
        className={`pointer-events-none absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
          showPlayIcon ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="rounded-full bg-black/40 p-4">
          <Icon
            name={playing ? "pause" : "play_arrow"}
            size={48}
            fill={1}
            className="text-white"
          />
        </div>
      </div>

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
