"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/Avatar";
import { Button } from "@/components/Button";
import { BottomNav } from "@/components/BottomNav";
import { Link } from "@/components/Link";
import { Tabs } from "@/components/Tabs";
import { TabsBox } from "@/components/Tabs";
import { Icon } from "@/components/Icon";
import { getDefaultProfile } from "@/lib/schemas/profile";
import { ROUTES } from "@/lib/routes";

const PROFILE_SECTION_TABS = [
  { id: "order", label: "Order", icon: "receipt_long" as const },
  { id: "favorites", label: "Favorites", icon: "favorite" as const },
  { id: "comments", label: "Comments", icon: "chat" as const },
  { id: "settings", label: "Settings", icon: "settings" as const },
];

const CONTENT_TABS = [
  { id: "my-videos", label: "My videos" },
  { id: "tagged", label: "Tagged" },
  { id: "repost", label: "Repost" },
  { id: "favorites", label: "Favorites" },
  { id: "like", label: "Like" },
];

function formatFollowerCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M Follower`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k Follower`;
  return `${n} Follower`;
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile] = useState(() => ({
    ...getDefaultProfile(),
    displayName: "TheLifeofRoy",
    username: "TheLifeofRoy",
    location: "Stockholm Sweden",
  }));
  const [profileSection, setProfileSection] = useState("order");
  const [contentTab, setContentTab] = useState("my-videos");

  const hasBio = Boolean(profile.bio?.trim());

  return (
    <div className="mx-auto flex min-h-dvh max-w-[440px] flex-col border-x border-slate-200 bg-white pb-[120px]">
      {/* Profile header (Figma Frame 362/370/380) */}
      <section className="flex flex-col gap-4 px-6 py-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-4">
            <Avatar
              src={profile.avatarUrl ?? null}
              alt={profile.displayName}
              size={80}
              className="shrink-0"
            />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold leading-[1.4] text-[var(--color-text-default-headings)] text-[length:var(--font-size-paragraph-xl)]">
                  {profile.displayName || "Display name"}
                </span>
                <Button
                  size="extraSmall"
                  variant="default"
                  leadingIcon="edit"
                  onClick={() => router.push(ROUTES.settingsAccount)}
                  aria-label="Edit profile"
                >
                  Edit
                </Button>
              </div>
              <div className="mt-1 flex flex-col gap-0.5">
                <span className="font-bold leading-[1.43] text-[var(--color-text-default-headings)] text-[length:var(--font-size-paragraph-sm)]">
                  @{profile.username || "username"}
                </span>
                {profile.location && (
                  <span className="font-semibold leading-[1.43] text-[var(--color-text-default-headings)] text-[length:var(--font-size-paragraph-sm)]">
                    {profile.location}
                  </span>
                )}
              </div>
            </div>
          </div>

          {!hasBio && (
            <Button
              size="small"
              variant="subtle"
              onClick={() => router.push(ROUTES.settingsAccount)}
              className="w-full justify-center"
            >
              Add some information about yourself
            </Button>
          )}

          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
              <Icon name="qr_code_2" size={24} />
            </span>
            <Link
              onClick={() => {}}
              size="medium"
              showIcon={true}
              className="flex-1"
            >
              {formatFollowerCount(profile.followerCount)}
            </Link>
          </div>
        </div>
      </section>

      {/* Section links (Order, Favorites, Comments, Settings) */}
      <section className="border-t border-slate-200">
        <TabsBox
          tabs={PROFILE_SECTION_TABS}
          value={profileSection}
          onValueChange={setProfileSection}
        />
      </section>

      {/* Content tabs (My videos, Tagged, ...) */}
      <section className="border-t border-slate-200 bg-white">
        <Tabs
          tabs={CONTENT_TABS}
          value={contentTab}
          onValueChange={setContentTab}
        />
      </section>

      {/* Empty state: video grid placeholder */}
      <section className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-12">
        <div className="flex aspect-square w-full max-w-[200px] items-center justify-center rounded-sm bg-slate-100">
          <Icon name="videocam" size={48} className="text-grey-400" fill={0} />
        </div>
        <p className="text-center font-medium text-grey-600 text-[length:var(--font-size-paragraph-sm)]">
          No videos yet
        </p>
      </section>

      <BottomNav activeItem="profile" />
    </div>
  );
}
