"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/Button";
import { Drawer } from "@/components/Drawer";
import { Input } from "@/components/Input";
import { Textarea } from "@/components/Textarea";
import { profileFormSchema, type ProfileForm } from "@/lib/schemas/profile";
import type { ProfileEditDrawerProps } from "./types";

export function ProfileEditDrawer({
  open,
  onClose,
  profile,
  onSave,
}: ProfileEditDrawerProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      displayName: profile.displayName,
      username: profile.username,
      location: profile.location ?? "",
      bio: profile.bio ?? "",
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        displayName: profile.displayName,
        username: profile.username,
        location: profile.location ?? "",
        bio: profile.bio ?? "",
      });
    }
  }, [open, profile.displayName, profile.username, profile.location, profile.bio, reset]);

  const onSubmit = (data: ProfileForm) => {
    onSave({
      displayName: data.displayName,
      username: data.username,
      location: data.location || undefined,
      bio: data.bio || undefined,
    });
    onClose();
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Edit Bio"
      side="right"
      width={440}
      aria-label="Edit profile"
      className="flex flex-col"
    >
      <form
        className="flex min-h-0 flex-1 flex-col"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        <div className="flex flex-1 flex-col gap-4 pb-4">
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
            placeholder="Add some information about yourself"
            rows={4}
            {...register("bio")}
          />
        </div>

        <div className="flex shrink-0 flex-col gap-6 border-t border-slate-200 bg-white py-6">
          <Button type="submit" variant="transparent" className="w-full">
            Save
          </Button>
        </div>
      </form>
    </Drawer>
  );
}
