import type { MaterialSymbol } from "material-symbols";
import type { Visibility } from "@/lib/schemas/post";

export const TRENDING_HASHTAGS = [
  "#viral",
  "#foryou",
  "#trending",
  "#reelz",
  "#fyp",
  "#explore",
  "#nightlife",
  "#art",
] as const;

export type VisibilityOption = {
  id: Visibility;
  label: string;
  description: string;
  icon: MaterialSymbol;
  emoji: string;
};

export const VISIBILITY_OPTIONS: VisibilityOption[] = [
  {
    id: "everyone",
    label: "Everyone",
    description: "Public — anyone on REELZ",
    icon: "public",
    emoji: "🌍",
  },
  {
    id: "followers",
    label: "Followers",
    description: "Only people who follow you",
    icon: "group",
    emoji: "👥",
  },
  {
    id: "friends",
    label: "Friends",
    description: "Close friends list only",
    icon: "favorite",
    emoji: "💛",
  },
  {
    id: "only_me",
    label: "Only me",
    description: "Just you, private draft",
    icon: "lock",
    emoji: "🔒",
  },
];

export type InteractionSetting = {
  id: "allowComments" | "allowDuets" | "allowDownload";
  label: string;
  description: string;
  icon: MaterialSymbol;
  emoji: string;
  defaultValue: boolean;
};

export const INTERACTION_SETTINGS: InteractionSetting[] = [
  {
    id: "allowComments",
    label: "Allow comments",
    description: "Let viewers comment on your reel",
    icon: "chat_bubble",
    emoji: "💬",
    defaultValue: true,
  },
  {
    id: "allowDuets",
    label: "Allow duets",
    description: "Let others create duets with this",
    icon: "dashboard_customize",
    emoji: "🎭",
    defaultValue: true,
  },
  {
    id: "allowDownload",
    label: "Allow download",
    description: "Let viewers save your video",
    icon: "download",
    emoji: "⬇️",
    defaultValue: false,
  },
];
