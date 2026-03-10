import type { Profile } from "@/lib/schemas/profile";

export type ProfileEditDrawerProps = {
  open: boolean;
  onClose: () => void;
  profile: Profile;
  onSave: (updates: Partial<Profile>) => void;
};
