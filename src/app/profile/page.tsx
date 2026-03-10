"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import { BottomNav } from "@/components/BottomNav";
import { useAuth } from "@/hooks/useAuth";
import { getUserProfile } from "@/lib/firestore";
import { ROUTES } from "@/lib/routes";

/**
 * /profile — redirects to the current user's profile when logged in,
 * or shows sign-in prompt when not authenticated.
 */
export default function ProfileRedirectPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (authLoading || !user) return;
    getUserProfile(user.uid)
      .then((profile) => {
        const segment = profile?.username?.trim() || user.uid;
        router.replace(ROUTES.profileByUsername(segment));
      })
      .catch(() => {
        router.replace(ROUTES.profileByUsername(user.uid));
      });
  }, [user, authLoading, router]);

  if (authLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-white">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto flex min-h-dvh w-full max-w-[440px] flex-col border-x border-slate-200 bg-white pb-[max(7.5rem,env(safe-area-inset-bottom)+5rem)]">
        <div className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-12 sm:px-6">
          <p className="text-center font-medium text-grey-700 text-[length:var(--font-size-body-md)]">
            Sign in to view your profile
          </p>
          <Button
            size="medium"
            onClick={() => router.push(ROUTES.login)}
            aria-label="Go to sign in"
          >
            Sign in
          </Button>
        </div>
        <BottomNav activeItem="profile" />
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-white">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
    </div>
  );
}
