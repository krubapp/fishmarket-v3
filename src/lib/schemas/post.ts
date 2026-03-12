import { z } from "zod";

export const VISIBILITY_VALUES = [
  "everyone",
  "followers",
  "friends",
  "only_me",
] as const;

export type Visibility = (typeof VISIBILITY_VALUES)[number];

export const postSchema = z.object({
  userId: z.string().min(1),
  videoUrl: z.url(),
  thumbnailUrl: z.url().optional(),
  caption: z.string().max(500).default(""),
  hashtags: z.array(z.string()).default([]),
  coverFrameColor: z.string().nullable().default(null),
  taggedUserIds: z.array(z.string()).default([]),
  taggedListingIds: z.array(z.string()).default([]),
  visibility: z.enum(VISIBILITY_VALUES).default("everyone"),
  allowComments: z.boolean().default(true),
  allowDuets: z.boolean().default(true),
  allowDownload: z.boolean().default(false),
  scheduledAt: z.number().nullable().default(null),
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

/** Zod schema for the multi-step create-post wizard form. */
export const createPostFormSchema = z.object({
  caption: z.string().max(300),
  hashtags: z.array(z.string()),
  coverFrameColor: z.string().nullable(),
  taggedUserIds: z.array(z.string()),
  taggedListingIds: z.array(z.string()),
  visibility: z.enum(VISIBILITY_VALUES),
  allowComments: z.boolean(),
  allowDuets: z.boolean(),
  allowDownload: z.boolean(),
  scheduledAt: z.number().nullable(),
});

export type CreatePostFormData = z.infer<typeof createPostFormSchema>;

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

export type PostComment = {
  id?: string;
  postId: string;
  userId: string;
  text: string;
  createdAt?: { seconds: number; nanoseconds: number };
};
