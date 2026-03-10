import { z } from "zod";

export const postSchema = z.object({
  userId: z.string().min(1),
  videoUrl: z.string().url(),
  thumbnailUrl: z.string().url().optional(),
  caption: z.string().max(500).default(""),
  likeCount: z.number().int().min(0).default(0),
  saveCount: z.number().int().min(0).default(0),
  commentCount: z.number().int().min(0).default(0),
});

export type PostFormData = z.infer<typeof postSchema>;

export type Post = PostFormData & {
  id?: string;
  createdAt?: { seconds: number; nanoseconds: number };
};

export type CreatePostInput = Omit<
  Post,
  "id" | "createdAt" | "likeCount" | "saveCount" | "commentCount"
>;

export type PostLike = {
  postId: string;
  userId: string;
  createdAt?: { seconds: number; nanoseconds: number };
};

export type PostSave = {
  postId: string;
  userId: string;
  createdAt?: { seconds: number; nanoseconds: number };
};
