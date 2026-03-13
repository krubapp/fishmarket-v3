"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BottomNav } from "@/components/BottomNav";
import { ContextTopBar } from "@/components/ContextTopBar";
import { Switch } from "@/components/Switch";
import { Snackbar } from "@/components/Snackbar";
import { useAuth } from "@/hooks/useAuth";
import { updateUserProfile } from "@/lib/firestore";
import { ROUTES } from "@/lib/routes";

export default function SettingsGeneralPage() {
  const { user, profile, profileLoading, refreshProfile } = useAuth();
  const router = useRouter();
  const [isSeller, setIsSeller] = useState(profile?.isSeller ?? false);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    icon?: "check_circle" | "error";
  }>({ open: false, message: "" });

  async function handleSellerToggle(checked: boolean) {
    if (!user || saving) return;
    setIsSeller(checked);
    setSaving(true);
    try {
      await updateUserProfile(user.uid, { isSeller: checked });
      await refreshProfile();
      setSnackbar({
        open: true,
        message: checked ? "Seller mode enabled" : "Seller mode disabled",
        icon: "check_circle",
      });
    } catch {
      setIsSeller(!checked);
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
        title="General"
        onBack={() => router.push(ROUTES.settings)}
      />

      <div className="mx-auto flex w-full max-w-[480px] flex-col">
        {profileLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
          </div>
        ) : (
          <div className="flex flex-col gap-6 px-6 py-6">
            <div className="flex flex-col gap-2">
              <h2 className="font-semibold text-[16px] text-[#121212]">
                Account
              </h2>
              <div className="flex items-center justify-between rounded-[8px] border border-slate-200 px-4 py-3">
                <div className="flex flex-col gap-0.5">
                  <span className="font-medium text-[14px] text-[#1e1e1e]">
                    Seller mode
                  </span>
                  <span className="font-normal text-[13px] text-[#787878]">
                    Enable to list and sell products
                  </span>
                </div>
                <Switch
                  checked={isSeller}
                  onChange={handleSellerToggle}
                  size="small"
                  aria-label="Toggle seller mode"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <Snackbar
        open={snackbar.open}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        message={snackbar.message}
        icon={snackbar.icon}
      />

      <BottomNav activeItem="profile" />
    </div>
  );
}
