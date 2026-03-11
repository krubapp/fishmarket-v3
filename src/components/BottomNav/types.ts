import { ROUTES } from "@/lib/routes";

/**
 * Bottom nav item identifier. Matches Figma component set variants:
 * types=home | types=shop | types=video | types=Map | types=Profile
 */
export type BottomNavItemId = "home" | "shop" | "add_video" | "feed" | "profile";

export type BottomNavProps = {
  activeItem: BottomNavItemId;
  onItemChange?: (item: BottomNavItemId) => void;
  className?: string;
};

export const BOTTOM_NAV_ITEMS: readonly { id: BottomNavItemId; label: string; href: string }[] = [
  { id: "home", label: "Home", href: ROUTES.home },
  { id: "shop", label: "Shop", href: ROUTES.shop },
  { id: "add_video", label: "Add Video", href: ROUTES.createPost },
  { id: "feed", label: "Feed", href: ROUTES.feed },
  { id: "profile", label: "Profile", href: ROUTES.profile },
] as const;
