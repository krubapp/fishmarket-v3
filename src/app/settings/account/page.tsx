"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Avatar } from "@/components/Avatar";
import { Button } from "@/components/Button";
import { ContextTopBar } from "@/components/ContextTopBar";
import { Icon } from "@/components/Icon";
import { Input } from "@/components/Input";
import { Snackbar } from "@/components/Snackbar";
import { Textarea } from "@/components/Textarea";
import { useAuth } from "@/hooks/useAuth";
import { getUserProfile, updateUserProfile } from "@/lib/firestore";
import { ROUTES } from "@/lib/routes";
import { profileFormSchema, type ProfileForm } from "@/lib/schemas/profile";
import { uploadAvatar } from "@/lib/storage";

export default function SettingsAccountPage() {
  const { user } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
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
      displayName: "",
      username: "",
      location: "",
      bio: "",
      tiktokUrl: "",
      youtubeUrl: "",
      instagramUrl: "",
    },
  });

  useEffect(() => {
    if (!user) return;
    getUserProfile(user.uid)
      .then((profile) => {
        if (profile) {
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
        }
      })
      .finally(() => setLoading(false));
  }, [user, reset]);

  useEffect(() => {
    if (!avatarFile) {
      setAvatarPreview(null);
      return;
    }
    const url = URL.createObjectURL(avatarFile);
    setAvatarPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [avatarFile]);

  function handleAvatarSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setAvatarFile(file);
  }

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

      setCurrentAvatarUrl(avatarUrl);
      setAvatarFile(null);
      setSnackbar({
        open: true,
        message: "Profile updated",
        icon: "check_circle",
      });
    } catch {
      setSnackbar({
        open: true,
        message: "Failed to update. Please try again.",
        icon: "error",
      });
    } finally {
      setSaving(false);
    }
  }

  const displayedAvatar = avatarPreview ?? currentAvatarUrl;

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <ContextTopBar
        backLabel="Settings"
        title="Account"
        onBack={() => router.push(ROUTES.settings)}
      />

      <div className="mx-auto flex w-full max-w-[440px] flex-col">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
          </div>
        ) : (
          <form
            className="flex flex-col gap-6 px-6 py-6"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
          >
            {/* Avatar */}
            <div className="flex flex-col items-center gap-3">
              <button
                type="button"
                className="group relative cursor-pointer rounded-full transition-opacity duration-(--duration-press) ease-(--ease-spring) active:scale-[0.95]"
                onClick={() => fileInputRef.current?.click()}
                aria-label="Change profile photo"
              >
                <Avatar src={displayedAvatar} alt="Profile photo" size={80} />
                <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity duration-(--duration-fast) group-hover:opacity-100">
                  <Icon name="photo_camera" size={28} className="text-white" />
                </span>
              </button>
              <button
                type="button"
                className="font-medium text-paragraph-sm text-slate-900 transition-colors hover:text-slate-950"
                onClick={() => fileInputRef.current?.click()}
              >
                Change photo
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarSelect}
              />
            </div>

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
                {...register("tiktokUrl")}
              />
              <Input
                label="YouTube URL"
                placeholder="https://youtube.com/@channel"
                type="url"
                {...register("youtubeUrl")}
              />
              <Input
                label="Instagram URL"
                placeholder="https://instagram.com/username"
                type="url"
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
