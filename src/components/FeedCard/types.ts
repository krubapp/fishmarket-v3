export type FeedCardTaggedProduct = {
  id: string;
  title: string;
  imageUrl?: string;
  price: string;
};

export type FeedCardTaggedUser = {
  id: string;
  displayName: string;
  avatarUrl?: string | null;
};

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
  coverFrameColor?: string | null;
  hashtags?: string[];
  taggedProducts?: FeedCardTaggedProduct[];
  taggedUsers?: FeedCardTaggedUser[];
  allowComments?: boolean;
  onHashtagPress?: (hashtag: string) => void;
  onProductPress?: (id: string) => void;
  onTaggedUserPress?: (id: string) => void;
  className?: string;
};
