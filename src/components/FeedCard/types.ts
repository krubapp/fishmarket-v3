export type FeedCardProps = {
  videoUrl: string;
  thumbnailUrl?: string;
  caption: string;
  userDisplayName: string;
  userAvatarUrl?: string | null;
  likeCount: number;
  saveCount: number;
  commentCount: number;
  liked: boolean;
  saved: boolean;
  onLike: () => void;
  onSave: () => void;
  onComment?: () => void;
  onShare?: () => void;
  onUserPress?: () => void;
  className?: string;
};
