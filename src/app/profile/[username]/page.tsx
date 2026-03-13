"use client";

import { use, useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Avatar } from "@/components/Avatar";
import { Button } from "@/components/Button";
import { BottomNav } from "@/components/BottomNav";
import { Icon } from "@/components/Icon";
import { IconButton } from "@/components/IconButton";
import { Link } from "@/components/Link";
import { Skeleton } from "@/components/Skeleton";
import { Snackbar } from "@/components/Snackbar";
import { Tabs } from "@/components/Tabs";
import { TabsBox } from "@/components/Tabs";
import { VideoThumbnailCard } from "@/components/VideoThumbnailCard";
import { useAuth } from "@/hooks/useAuth";
import {
  getUserProfileByUsernameOrId,
  getUserPosts,
  getTaggedPosts,
  getUserLikedPosts,
  getUserProfiles,
  type UserProfile,
} from "@/lib/firestore";
import type { Post } from "@/lib/schemas/post";
import { ROUTES } from "@/lib/routes";

const QR_CODE_SIZE = 280;

function getProfileUrl(usernameOrId: string): string {
  if (typeof window === "undefined") return "";
  const path = ROUTES.profileByUsername(usernameOrId);
  return `${window.location.origin}${path}`;
}

const PROFILE_SECTION_TABS = [
  { id: "order", label: "Order", icon: "delivery_truck_speed" as const, href: ROUTES.profileOrders },
  { id: "favorites", label: "Favorites", icon: "favorite" as const, href: ROUTES.profileFavorites },
  { id: "collections", label: "Collections", icon: "folder" as const, href: ROUTES.profileCollections },
  { id: "comments", label: "Comments", icon: "chat" as const, href: ROUTES.profileComments },
];

const CONTENT_TABS_BASE = [
  { id: "my-videos", labelOwn: "My videos", labelOther: "Videos" },
  { id: "tagged", label: "Tagged" },
  { id: "repost", label: "Repost" },
  { id: "like", label: "Like" },
] as const;

function getContentTabs(isOwnProfile: boolean) {
  return CONTENT_TABS_BASE.map((tab) =>
    "labelOwn" in tab
      ? { id: tab.id, label: isOwnProfile ? tab.labelOwn : tab.labelOther }
      : { id: tab.id, label: tab.label },
  );
}

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

type ProfileByUsernamePageProps = { params: Promise<{ username: string }> };

export default function ProfileByUsernamePage({ params }: ProfileByUsernamePageProps) {
  const router = useRouter();
  const { username: usernameParam = "" } = use(params);
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const pathname = usePathname();
  const [contentTab, setContentTab] = useState("my-videos");
  const [tabPosts, setTabPosts] = useState<Post[]>([]);
  const [tabLoading, setTabLoading] = useState(false);
  const [creatorProfiles, setCreatorProfiles] = useState<Map<string, UserProfile>>(new Map());
  const [qrPopupOpen, setQrPopupOpen] = useState(false);
  const [shareSnackbarOpen, setShareSnackbarOpen] = useState(false);

  const fetchTabData = useCallback(async (tab: string, uid: string) => {
    setTabLoading(true);
    setTabPosts([]);
    try {
      let posts: Post[] = [];
      switch (tab) {
        case "my-videos":
          posts = await getUserPosts(uid);
          break;
        case "tagged":
          posts = await getTaggedPosts(uid);
          break;
        case "like":
          posts = await getUserLikedPosts(uid);
          break;
        case "repost":
          posts = [];
          break;
      }
      setTabPosts(posts);

      const uniqueUserIds = [...new Set(posts.map((p) => p.userId))];
      if (uniqueUserIds.length > 0) {
        const profiles = await getUserProfiles(uniqueUserIds);
        setCreatorProfiles(profiles);
      }
    } catch (err) {
      console.error("Failed to fetch tab data:", err);
      setTabPosts([]);
    } finally {
      setTabLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!profile?.uid) return;
    fetchTabData(contentTab, profile.uid);
  }, [contentTab, profile?.uid, fetchTabData]);

  useEffect(() => {
    if (!qrPopupOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setQrPopupOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [qrPopupOpen]);

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

  const pagePaddingBottom = "pb-[max(7.5rem,env(safe-area-inset-bottom)+5rem)]";

  if (authLoading || (usernameParam && profileLoading)) {
    return (
      <div
        className={`mx-auto flex min-h-dvh w-full min-w-0 max-w-[440px] flex-col border-x border-slate-200 bg-white lg:max-w-6xl lg:flex-row lg:gap-8 lg:border-x-0 lg:px-8 ${pagePaddingBottom}`}
      >
        <aside className="lg:w-[320px] lg:shrink-0 lg:rounded-xl lg:border lg:border-slate-200 lg:bg-white lg:p-6 lg:shadow-sm">
          <div className="lg:sticky lg:top-6">
            <section className="flex flex-col items-center px-4 py-4 sm:px-6 sm:py-6 lg:items-start lg:border-0 lg:px-0 lg:py-0">
              <div className="flex w-full max-w-[360px] flex-col items-center gap-3 sm:gap-4 lg:max-w-none lg:items-start">
                <Skeleton className="h-20 w-20 rounded-full" />
                <div className="flex flex-col items-center gap-1 lg:items-start">
                  <Skeleton className="h-6 w-40" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <div className="flex w-full flex-col gap-1.5">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
                <div className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-5 w-28" />
                </div>
                <div className="flex items-center gap-6">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
              </div>
            </section>
            <section className="border-y border-slate-200 px-4 py-[10px] sm:px-6 lg:border-y-0 lg:border-t lg:px-0 lg:pt-6">
              <TabsBox
                tabs={PROFILE_SECTION_TABS}
                value=""
                className="w-full justify-center lg:justify-start"
                iconWeight={100}
              />
            </section>
          </div>
        </aside>

        <main className="flex min-w-0 flex-1 flex-col">
          <section className="border-t border-slate-200 bg-white py-3 lg:border-t-0">
            <div className="overflow-x-auto overflow-y-hidden scrollbar-none">
              <Tabs
                tabs={getContentTabs(false)}
                value="my-videos"
                onValueChange={() => {}}
                className="!flex-nowrap shrink-0 px-4 sm:px-6 lg:px-0"
              />
            </div>
          </section>
          <section className="flex-1 py-0.5">
            <div className="grid grid-cols-3 gap-1">
              {Array.from({ length: 6 }, (_, i) => (
                <Skeleton key={i} className="aspect-4/5 w-full rounded-[2px]" />
              ))}
            </div>
          </section>
        </main>

        <BottomNav activeItem="profile" />
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <div className={`mx-auto flex min-h-dvh w-full max-w-[440px] flex-col border-x border-slate-200 bg-white lg:max-w-6xl lg:border-x-0 ${pagePaddingBottom}`}>
        <div className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-12 sm:px-6">
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

  const profileCard = (
    <>
      {/* Profile header — centered on mobile, left-aligned card on desktop */}
      <section className="flex flex-col items-center px-4 py-4 sm:px-6 sm:py-6 lg:items-start lg:border-0 lg:px-0 lg:py-0">
        <div className="flex w-full max-w-[360px] flex-col items-center gap-3 sm:gap-4 lg:max-w-none lg:items-start">
          <div
            className={`flex w-full items-start ${isOwnProfile ? "justify-between" : "justify-center"}`}
          >
            {isOwnProfile && (
              <div className="w-12 shrink-0" aria-hidden />
            )}
            <Avatar
              src={display.avatarUrl}
              alt={display.displayName || "Profile"}
              size={80}
              className="shrink-0"
            />
            {isOwnProfile ? (
              <IconButton
                name="settings"
                size="xlarge"
                variant="transparent"
                aria-label="Settings"
                onClick={() => router.push(ROUTES.settings)}
                iconWeight={100}
              />
            ) : null}
          </div>
          <div className="flex flex-col items-center gap-1 lg:items-start">
            <div className="flex items-center justify-center gap-2 lg:justify-start">
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
            <div className="flex flex-col items-center gap-0.5 text-center lg:items-start lg:text-left">
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
            <p className="w-full min-w-0 break-words text-center font-medium leading-[1.5] text-[var(--color-text-default-body)] text-[length:var(--font-size-paragraph-md)] lg:text-left">
              {display.bio}
            </p>
          ) : (
            isOwnProfile && (
              <Button
                size="small"
                variant="subtle"
                onClick={() => router.push(ROUTES.settingsAccount)}
                className="h-9 w-full justify-center rounded-full lg:justify-start"
              >
                Add some information about yourself
              </Button>
            )
          )}

          <div className="flex items-center justify-center gap-3 lg:justify-start">
            <button
              type="button"
              onClick={() => setQrPopupOpen(true)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded text-slate-600 transition-colors hover:text-slate-900"
              aria-label="Show QR code"
            >
              <Icon name="qr_code_2" size={40} weight={100} />
            </button>
            <Link
              onClick={() => {}}
              size="medium"
              showIcon
              className="font-medium text-[var(--color-text-default-headings)]"
            >
              {formatFollowerCount(display.followerCount)}
            </Link>
          </div>

          <div className="flex items-center justify-center gap-6 lg:justify-start">
            {display.tiktokUrl && (
              <a
                href={display.tiktokUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded p-1 text-slate-600 transition-colors hover:text-slate-900"
                aria-label="TikTok"
              >
                <Icon name="videocam" size={24} fill={0} weight={100} />
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
                <Icon name="smart_display" size={24} fill={0} weight={100} />
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
                <Icon name="photo_camera" size={24} fill={0} weight={100} />
              </a>
            )}
            <button
              type="button"
              onClick={async () => {
                const url = typeof window !== "undefined" ? window.location.href : "";
                if (!url) return;
                if (navigator.share) {
                  try {
                    await navigator.share({
                      url,
                      title: display.displayName || "Profile",
                      text: display.bio || undefined,
                    });
                  } catch {
                    // User cancelled or share failed; no need to surface
                  }
                  return;
                }
                // Desktop fallback when Web Share API isn't available: copy link
                try {
                  await navigator.clipboard?.writeText(url);
                  setShareSnackbarOpen(true);
                } catch {
                  // Clipboard failed (e.g. insecure context)
                }
              }}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded p-1 text-slate-600 transition-colors hover:text-slate-900"
              aria-label="Share profile"
            >
              <Icon name="share" size={24} fill={0} weight={100} />
            </button>
          </div>
        </div>
      </section>

      {isOwnProfile && (
        <section className="border-y border-slate-200 px-4 py-[10px] sm:px-6 lg:border-y-0 lg:border-t lg:px-0 lg:pt-6">
          <TabsBox
            tabs={PROFILE_SECTION_TABS}
            value={pathname ?? ""}
            className="w-full justify-center lg:justify-start"
            iconWeight={100}
          />
        </section>
      )}
    </>
  );

  return (
    <div
      className={`mx-auto flex min-h-dvh w-full min-w-0 max-w-[440px] flex-col border-x border-slate-200 bg-white lg:max-w-6xl lg:flex-row lg:gap-8 lg:border-x-0 lg:px-8 ${pagePaddingBottom}`}
    >
      {/* Left: profile card (desktop) / full-width (mobile) */}
      <aside className="lg:w-[320px] lg:shrink-0 lg:rounded-xl lg:border lg:border-slate-200 lg:bg-white lg:p-6 lg:shadow-sm">
        <div className="lg:sticky lg:top-6">{profileCard}</div>
      </aside>

      {/* Right: content tabs + video area */}
      <main className="flex min-w-0 flex-1 flex-col">
        <section className="border-t border-slate-200 bg-white py-3 lg:border-t-0">
          <div className="overflow-x-auto overflow-y-hidden scrollbar-none">
            <Tabs
              tabs={getContentTabs(isOwnProfile)}
              value={contentTab}
              onValueChange={setContentTab}
              className="!flex-nowrap shrink-0 px-4 sm:px-6 lg:px-0"
            />
          </div>
        </section>

        <section className="flex-1 py-0.5">
          {tabLoading ? (
            <div className="grid grid-cols-3 gap-1">
              {Array.from({ length: 6 }, (_, i) => (
                <Skeleton key={i} className="aspect-4/5 w-full rounded-[2px]" />
              ))}
            </div>
          ) : contentTab === "repost" ? (
            <div className="flex flex-col items-center justify-center gap-3 px-4 py-16">
              <Icon name="repeat" size={40} className="text-grey-400" fill={0} weight={100} />
              <p className="text-center font-medium text-grey-600 text-paragraph-sm">
                Coming soon
              </p>
            </div>
          ) : tabPosts.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 px-4 py-16">
              <Icon
                name={contentTab === "my-videos" ? "videocam" : contentTab === "tagged" ? "sell" : "favorite"}
                size={40}
                className="text-grey-400"
                fill={0}
                weight={100}
              />
              <p className="text-center font-medium text-grey-600 text-paragraph-sm">
                {contentTab === "my-videos"
                  ? isOwnProfile
                    ? "No videos yet"
                    : "No videos"
                  : contentTab === "tagged"
                    ? "No tagged posts"
                    : "No liked posts"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-1">
              {tabPosts.map((post) => {
                const creator = creatorProfiles.get(post.userId);
                const showCreator = contentTab !== "my-videos";
                return (
                  <VideoThumbnailCard
                    key={post.id}
                    thumbnailUrl={post.thumbnailUrl ?? null}
                    viewCount={post.viewCount ?? post.likeCount ?? 0}
                    creatorAvatarUrl={showCreator ? (creator?.avatarUrl ?? null) : undefined}
                    creatorName={showCreator ? (creator?.displayName ?? undefined) : undefined}
                    onClick={() => post.id && router.push(ROUTES.postDetail(post.id))}
                  />
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* QR code popup — portal so it renders on top */}
      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {qrPopupOpen && usernameParam && (
              <div
                className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
                role="dialog"
                aria-modal="true"
                aria-label="Profile QR code"
              >
                <motion.div
                  className="absolute inset-0 bg-black/50"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  aria-hidden
                  onClick={() => setQrPopupOpen(false)}
                />
                <motion.div
                  className="relative flex max-h-[calc(100dvh-2rem)] w-full max-w-[min(100vw-2rem,320px)] flex-col items-center gap-3 overflow-auto rounded-2xl bg-white p-4 shadow-lg sm:gap-4 sm:p-6"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2, ease: [0.33, 1, 0.68, 1] }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <IconButton
                    name="close"
                    size="small"
                    variant="transparent"
                    className="absolute right-2 top-2 sm:right-3 sm:top-3"
                    aria-label="Close"
                    onClick={() => setQrPopupOpen(false)}
                  />
                  <p className="font-semibold text-[var(--color-text-default-headings)] text-[length:var(--font-size-paragraph-lg)]">
                    Scan to view profile
                  </p>
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=${QR_CODE_SIZE}x${QR_CODE_SIZE}&data=${encodeURIComponent(getProfileUrl(usernameParam))}`}
                    alt="QR code to profile"
                    width={QR_CODE_SIZE}
                    height={QR_CODE_SIZE}
                    className="h-auto max-h-[min(50dvh,280px)] w-auto max-w-full rounded-lg border border-slate-200"
                  />
                  <p className="max-w-full truncate text-center font-medium text-grey-600 text-[length:var(--font-size-paragraph-sm)]">
                    {getProfileUrl(usernameParam)}
                  </p>
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body
        )}

      <Snackbar
        open={shareSnackbarOpen}
        onClose={() => setShareSnackbarOpen(false)}
        message="Link copied"
        icon="link"
        duration={3000}
      />
      <BottomNav activeItem="profile" />
    </div>
  );
}
