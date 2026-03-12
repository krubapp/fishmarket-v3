export type CommentDrawerProps = {
  open: boolean;
  onClose: () => void;
  postId: string | null;
  commentCount: number;
  onCommentCountChange: (postId: string, delta: number) => void;
};
