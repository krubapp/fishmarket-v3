export type VideoPlayerProps = {
  src: string;
  /** Poster / thumbnail image URL shown while loading */
  poster?: string;
  /** Whether the player should attempt to auto-play when visible (default true) */
  autoPlay?: boolean;
  /** Intersection Observer threshold for auto-play (default 0.5) */
  visibilityThreshold?: number;
  /** Called when play state changes */
  onPlayChange?: (playing: boolean) => void;
  className?: string;
};
