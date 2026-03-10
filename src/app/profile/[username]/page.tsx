"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Avatar } from "@/components/Avatar";
import { Button } from "@/components/Button";
import { BottomNav } from "@/components/BottomNav";
import { Link } from "@/components/Link";
import { Tabs } from "@/components/Tabs";
import { TabsBox } from "@/components/Tabs";
import { Icon } from "@/components/Icon";
import { useAuth } from "@/hooks/useAuth";
import {
  getUserProfileByUsernameOrId,
  type UserProfile,
} from "@/lib/firestore";
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

function profileToDisplay(profile: UserProfile | null): {
  displayName: string;
  username: string;
  location: string;
  bio: string;
  avatarUrl: string | null;
  followerCount: number;
  tiktokUrl: string | undefined;
  youtubeUrl: string | undefined;
  instagramUrl: string | undefined;
} {
  if (!profile) {
    return {
      displayName: "",
      username: "",
      location: "",
      bio: "",
      avatarUrl: null,
      followerCount: 0,
      tiktokUrl: undefined,
      youtubeUrl: undefined,
      instagramUrl: undefined,
    };
  }
  return {
    displayName: profile.displayName ?? "",
    username: profile.username ?? "",
    location: profile.location ?? "",
    bio: profile.bio ?? "",
    avatarUrl: profile.avatarUrl ?? null,
    followerCount: profile.followerCount ?? 0,
    tiktokUrl: profile.tiktokUrl?.trim() || undefined,
    youtubeUrl: profile.youtubeUrl?.trim() || undefined,
    instagramUrl: profile.instagramUrl?.trim() || undefined,
  };
}

export default function ProfileByUsernamePage() {
  const router = useRouter();
  const params = useParams();
  const usernameParam = typeof params?.username === "string" ? params.username : "";
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [profileSection, setProfileSection] = useState("order");
  const [contentTab, setContentTab] = useState("my-videos");

  useEffect(() => {
    if (!usernameParam) {
      setProfile(null);
      setProfileLoading(false);
      setNotFound(true);
      return;
    }
    setProfileLoading(true);
    setNotFound(false);
    getUserProfileByUsernameOrId(usernameParam)
      .then((data) => {
        setProfile(data ?? null);
        setNotFound(!data);
      })
      .finally(() => setProfileLoading(false));
  }, [usernameParam]);

  const display = profileToDisplay(profile);
  const hasBio = Boolean(display.bio?.trim());
  const isOwnProfile = Boolean(user && profile && user.uid === profile.uid);

  function handleSectionChange(id: string) {
    if (id === "settings") {
      router.push(ROUTES.settings);
      return;
    }
    setProfileSection(id);
  }

  if (authLoading || (usernameParam && profileLoading)) {
    return (
      <div className="mx-auto flex min-h-dvh max-w-[440px] flex-col border-x border-slate-200 bg-white pb-[120px]">
        <div className="flex flex-1 items-center justify-center px-6 py-12">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
        </div>
        <BottomNav activeItem="profile" />
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <div className="mx-auto flex min-h-dvh max-w-[440px] flex-col border-x border-slate-200 bg-white pb-[120px]">
        <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-12">
          <p className="text-center font-medium text-grey-700 text-[length:var(--font-size-paragraph-md)]">
            Profile not found
          </p>
          <Button
            size="medium"
            variant="subtle"
            onClick={() => router.push(ROUTES.home)}
            aria-label="Go to home"
          >
            Go to home
          </Button>
        </div>
        <BottomNav activeItem="profile" />
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-[440px] flex-col border-x border-slate-200 bg-white pb-[120px]">
      {/* Profile header — centered column (Figma 731:3430) */}
      <section className="flex flex-col items-center px-6 py-6">
        <div className="flex w-full max-w-[360px] flex-col items-center gap-3">
          <Avatar
            src={display.avatarUrl}
            alt={display.displayName || "Profile"}
            size={80}
            className="shrink-0"
          />
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center justify-center gap-2">
              <span className="font-semibold leading-[var(--line-height-paragraph-xl)] text-[var(--color-text-default-headings)] text-[length:var(--font-size-paragraph-xl)]">
                {display.displayName || "Display name"}
              </span>
              {isOwnProfile && (
                <Button
                  size="extraSmall"
                  variant="default"
                  onClick={() => router.push(ROUTES.settingsAccount)}
                  aria-label="Edit profile"
                >
                  Edit
                </Button>
              )}
            </div>
            <div className="flex flex-col items-center gap-0.5 text-center">
              <span className="font-bold leading-[1.43] text-[var(--color-text-default-headings)] text-[length:var(--font-size-paragraph-sm)]">
                @{display.username || "username"}
              </span>
              {display.location && (
                <span className="font-semibold leading-[1.43] text-[var(--color-text-default-headings)] text-[length:var(--font-size-paragraph-sm)]">
                  {display.location}
                </span>
              )}
            </div>
          </div>

          {hasBio ? (
            <p className="w-full text-center font-medium leading-[1.5] text-[var(--color-text-default-body)] text-[length:var(--font-size-paragraph-md)]">
              {display.bio}
            </p>
          ) : (
            isOwnProfile && (
              <Button
                size="small"
                variant="subtle"
                onClick={() => router.push(ROUTES.settingsAccount)}
                className="h-9 w-full justify-center rounded-full"
              >
                Add some information about yourself
              </Button>
            )
          )}

          <div className="flex items-center justify-center gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center text-slate-600">
              <Icon name="qr_code_2" size={24} />
            </span>
            <Link
              onClick={() => {}}
              size="medium"
              showIcon
              className="font-medium text-[var(--color-text-default-headings)]"
            >
              {formatFollowerCount(display.followerCount)}
            </Link>
          </div>

          {/* Social links row (TikTok, YouTube, Instagram, Share) — Figma 718:6197 */}
          <div className="flex items-center justify-center gap-6">
            {display.tiktokUrl && (
              <a
                href={display.tiktokUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded p-1 text-slate-600 transition-colors hover:text-slate-900"
                aria-label="TikTok"
              >
                <Icon name="videocam" size={24} fill={0} />
              </a>
            )}
            {display.youtubeUrl && (
              <a
                href={display.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded p-1 text-slate-600 transition-colors hover:text-slate-900"
                aria-label="YouTube"
              >
                <Icon name="smart_display" size={24} fill={0} />
              </a>
            )}
            {display.instagramUrl && (
              <a
                href={display.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded p-1 text-slate-600 transition-colors hover:text-slate-900"
                aria-label="Instagram"
              >
                <Icon name="photo_camera" size={24} fill={0} />
              </a>
            )}
            <button
              type="button"
              onClick={() => {
                const url = typeof window !== "undefined" ? window.location.href : "";
                if (url && navigator.share) {
                  navigator.share({ url, title: display.displayName || "Profile" }).catch(() => {});
                } else {
                  navigator.clipboard?.writeText(url).then(() => {});
                }
              }}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded p-1 text-slate-600 transition-colors hover:text-slate-900"
              aria-label="Share profile"
            >
              <Icon name="share" size={24} fill={0} />
            </button>
          </div>
        </div>
      </section>

      {/* Section TabsBox (Order, Favorites, Comments, Settings) — only for own profile */}
      {isOwnProfile && (
        <section className="border-y border-slate-200 px-6 py-[10px]">
          <TabsBox
            tabs={PROFILE_SECTION_TABS}
            value={profileSection}
            onValueChange={handleSectionChange}
            className="w-full justify-center"
          />
        </section>
      )}

      {/* Content tabs (My videos, Tagged, Repost, Favorites, Like) */}
      <section className="border-t border-slate-200 bg-white py-3">
        <div className="overflow-x-auto overflow-y-hidden">
          <Tabs
            tabs={CONTENT_TABS}
            value={contentTab}
            onValueChange={setContentTab}
            className="!flex-nowrap shrink-0 px-6"
          />
        </div>
      </section>

      {/* Empty state: single video placeholder (Figma Status=empty, size=small 144×180) */}
      <section className="flex flex-1 flex-col items-center justify-start px-6 py-8">
        <div className="flex h-[180px] w-[144px] items-center justify-center overflow-hidden rounded-[2px] bg-slate-100">
          <Icon name="videocam" size={40} className="text-grey-400" fill={0} />
        </div>
        <p className="mt-4 text-center font-medium text-grey-600 text-[length:var(--font-size-paragraph-sm)]">
          No videos yet
        </p>
      </section>

      <BottomNav activeItem="profile" />
    </div>
  );
}
