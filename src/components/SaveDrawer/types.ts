export type SaveDrawerProps = {
  open: boolean;
  onClose: () => void;
  postId: string | null;
  onSavedChange: (postId: string, isSaved: boolean) => void;
};
