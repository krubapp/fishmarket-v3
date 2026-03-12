export type SaveCollection = {
  id?: string;
  userId: string;
  name: string;
  createdAt?: { seconds: number; nanoseconds: number };
  updatedAt?: { seconds: number; nanoseconds: number };
};

export type CollectionItem = {
  collectionId: string;
  postId: string;
  userId: string;
  createdAt?: { seconds: number; nanoseconds: number };
};
