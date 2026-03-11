import { z } from "zod";

/**
 * User profile schema for Firebase (e.g. users/{uid} or profiles/{uid}).
 * Tied to the profile page: display name, username, location, bio, avatar, follower count.
 */
const optionalUrl = z
  .string()
  .refine(
    (v) => !v.trim() || z.url().safeParse(v.trim()).success,
    "Enter a valid URL",
  );

export const profileSchema = z.object({
  displayName: z.string().min(1, "Display name is required"),
  username: z
    .string()
    .min(1, "Username is required")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  location: z.string().optional(),
  bio: z.string().max(500).optional(),
  avatarUrl: z.url().optional().nullable(),
  tiktokUrl: optionalUrl,
  youtubeUrl: optionalUrl,
  instagramUrl: optionalUrl,
  isSeller: z.boolean().default(false),
  followerCount: z.number().int().min(0).default(0),
  createdAt: z.unknown().optional(),
  updatedAt: z.unknown().optional(),
});

export type Profile = z.infer<typeof profileSchema>;

/** Form schema for Edit Bio (subset + optional for partial update). */
export const profileFormSchema = profileSchema.pick({
  displayName: true,
  username: true,
  location: true,
  bio: true,
  tiktokUrl: true,
  youtubeUrl: true,
  instagramUrl: true,
});

export type ProfileForm = z.infer<typeof profileFormSchema>;

/** Default empty profile for initial state. */
export function getDefaultProfile(): Profile {
  return {
    displayName: "",
    username: "",
    location: undefined,
    bio: undefined,
    avatarUrl: null,
    tiktokUrl: "",
    youtubeUrl: "",
    instagramUrl: "",
    isSeller: false,
    followerCount: 0,
  };
}
