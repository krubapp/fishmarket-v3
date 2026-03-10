"use client";

import { useRouter } from "next/navigation";
import { BottomNav } from "@/components/BottomNav";
import { ContextTopBar } from "@/components/ContextTopBar";
import { ROUTES } from "@/lib/routes";

export default function ProfileFavoritesPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-dvh flex-col bg-white">
      <ContextTopBar
        backLabel="Profile"
        title="Favorites"
        onBack={() => router.push(ROUTES.profile)}
      />
      <div className="mx-auto flex w-full max-w-[440px] flex-1 flex-col items-center justify-center gap-4 px-6 py-12">
        <p className="text-center font-medium text-grey-700 text-[length:var(--font-size-paragraph-md)]">
          Your favorites will appear here.
        </p>
        <p className="text-center text-grey-600 text-[length:var(--font-size-paragraph-sm)]">
          This page is not built yet.
        </p>
      </div>
      <BottomNav activeItem="profile" />
    </div>
  );
}
