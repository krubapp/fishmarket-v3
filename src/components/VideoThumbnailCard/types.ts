export type VideoThumbnailCardProps = {
  thumbnailUrl: string | null;
  viewCount: number;
  creatorAvatarUrl?: string | null;
  creatorName?: string;
  onClick?: () => void;
  className?: string;
};
