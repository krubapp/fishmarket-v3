/**
 * Bottom nav item identifier. Matches Figma component set variants:
 * types=home | types=shop | types=video | types=Map | types=Profile
 */
export type BottomNavItemId = "home" | "shop" | "create" | "map" | "profile";

export type BottomNavProps = {
  activeItem: BottomNavItemId;
  onItemChange?: (item: BottomNavItemId) => void;
  className?: string;
};

export const BOTTOM_NAV_ITEMS: readonly { id: BottomNavItemId; label: string }[] = [
  { id: "home", label: "Home" },
  { id: "shop", label: "Shop" },
  { id: "create", label: "Create" },
  { id: "map", label: "Map" },
  { id: "profile", label: "Profile" },
] as const;
