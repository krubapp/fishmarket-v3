"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Avatar } from "@/components/Avatar";
import { Button } from "@/components/Button";
import { ContextTopBar } from "@/components/ContextTopBar";
import { Input } from "@/components/Input";
import { MediaDropzone } from "@/components/MediaDropzone";
import { Snackbar } from "@/components/Snackbar";
import { Textarea } from "@/components/Textarea";
import { useAuth } from "@/hooks/useAuth";
import { updateUserProfile } from "@/lib/firestore";
import { ROUTES } from "@/lib/routes";
import { profileFormSchema, type ProfileForm } from "@/lib/schemas/profile";
import { uploadAvatar } from "@/lib/storage";

export default function SettingsAccountPage() {
  const { user, profile, profileLoading, refreshProfile } = useAuth();
  const router = useRouter();
  const formInitialized = useRef(false);

  const [saving, setSaving] = useState(false);
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState<string | null>(
    profile?.avatarUrl ?? null,
  );
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    icon?: "check_circle" | "error";
  }>({ open: false, message: "" });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      displayName: profile?.displayName ?? "",
      username: profile?.username ?? "",
      location: profile?.location ?? "",
      bio: profile?.bio ?? "",
      tiktokUrl: profile?.tiktokUrl ?? "",
      youtubeUrl: profile?.youtubeUrl ?? "",
      instagramUrl: profile?.instagramUrl ?? "",
    },
  });

  useEffect(() => {
    if (!profile || formInitialized.current) return;
    formInitialized.current = true;
    reset({
      displayName: profile.displayName ?? "",
      username: profile.username ?? "",
      location: profile.location ?? "",
      bio: profile.bio ?? "",
      tiktokUrl: profile.tiktokUrl ?? "",
      youtubeUrl: profile.youtubeUrl ?? "",
      instagramUrl: profile.instagramUrl ?? "",
    });
    setCurrentAvatarUrl(profile.avatarUrl ?? null);
  }, [profile, reset]);

  async function onSubmit(data: ProfileForm) {
    if (!user || saving) return;
    setSaving(true);
    try {
      let avatarUrl = currentAvatarUrl;
      if (avatarFile) {
        avatarUrl = await uploadAvatar(avatarFile, user.uid);
      }

      await updateUserProfile(user.uid, {
        displayName: data.displayName,
        username: data.username,
        location: data.location || undefined,
        bio: data.bio || undefined,
        tiktokUrl: data.tiktokUrl?.trim() || undefined,
        youtubeUrl: data.youtubeUrl?.trim() || undefined,
        instagramUrl: data.instagramUrl?.trim() || undefined,
        avatarUrl,
      });

      await refreshProfile();
      setCurrentAvatarUrl(avatarUrl ?? null);
      setAvatarFile(null);
      const profileSegment = data.username?.trim() || user.uid;
      router.push(ROUTES.profileByUsername(profileSegment));
    } catch (err) {
      console.error("Settings account update failed:", err);
      setSnackbar({
        open: true,
        message: "Failed to update. Please try again.",
        icon: "error",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <ContextTopBar
        backLabel="Settings"
        title="Account"
        onBack={() => router.push(ROUTES.settings)}
      />

      <div className="mx-auto flex w-full max-w-[440px] flex-col">
        {profileLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
          </div>
        ) : (
          <form
            className="flex flex-col gap-6 px-6 py-6"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
          >
            {/* Profile photo dropzone */}
            <MediaDropzone
              title="Profile photo"
              subtitle="Drop or click to upload a photo"
              files={avatarFile ? [avatarFile] : []}
              onFilesChange={(files) => setAvatarFile(files[0] ?? null)}
              onConversionError={() => {
                setSnackbar({
                  open: true,
                  message: "Could not convert some images. Try a JPEG or PNG.",
                  icon: "error",
                });
              }}
              accept="image/*,.heic,image/heic,.dng,image/x-adobe-dng"
              maxFiles={1}
              className="rounded-lg"
            >
              <div className="flex flex-col items-center justify-center gap-3 py-4">
                <Avatar
                  src={currentAvatarUrl}
                  alt="Profile photo"
                  size={80}
                />
                <span className="font-medium text-paragraph-sm text-slate-600">
                  Drop or click to upload profile photo
                </span>
              </div>
            </MediaDropzone>

            {/* Form fields */}
            <div className="flex flex-col gap-4">
              <Input
                label="Display name"
                placeholder="Your display name"
                error={Boolean(errors.displayName)}
                helperText={errors.displayName?.message}
                {...register("displayName")}
              />
              <Input
                label="Username"
                placeholder="username"
                error={Boolean(errors.username)}
                helperText={errors.username?.message}
                {...register("username")}
              />
              <Input
                label="Location"
                placeholder="City, Country"
                {...register("location")}
              />
              <Textarea
                label="Bio"
                placeholder="Tell us about yourself"
                rows={4}
                error={Boolean(errors.bio)}
                helperText={errors.bio?.message}
                {...register("bio")}
              />
              <Input
                label="TikTok URL"
                placeholder="https://tiktok.com/@username"
                type="url"
                error={Boolean(errors.tiktokUrl)}
                helperText={errors.tiktokUrl?.message}
                {...register("tiktokUrl")}
              />
              <Input
                label="YouTube URL"
                placeholder="https://youtube.com/@channel"
                type="url"
                error={Boolean(errors.youtubeUrl)}
                helperText={errors.youtubeUrl?.message}
                {...register("youtubeUrl")}
              />
              <Input
                label="Instagram URL"
                placeholder="https://instagram.com/username"
                type="url"
                error={Boolean(errors.instagramUrl)}
                helperText={errors.instagramUrl?.message}
                {...register("instagramUrl")}
              />
            </div>

            {/* Save button */}
            <Button
              type="submit"
              size="large"
              loading={saving}
              className="w-full"
            >
              Save changes
            </Button>
          </form>
        )}
      </div>

      <Snackbar
        open={snackbar.open}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        message={snackbar.message}
        icon={snackbar.icon}
      />
    </div>
  );
}
