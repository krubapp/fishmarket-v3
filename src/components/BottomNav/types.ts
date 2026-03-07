/**
 * Bottom nav item identifier. Matches Figma component set variants:
 * types=home | types=shop | types=video | types=Map | types=Profile
 */
export type BottomNavItemId = "home" | "shop" | "create" | "map" | "profile";

export type BottomNavProps = {
  /** Which item is currently active (selected). */
  activeItem: BottomNavItemId;
  /** Called when an item is pressed. */
  onItemChange?: (item: BottomNavItemId) => void;
  /** Optional class for the root nav element. */
  className?: string;
};

export const BOTTOM_NAV_ITEMS: readonly { id: BottomNavItemId; label: string }[] = [
  { id: "home", label: "Home" },
  { id: "shop", label: "Shop" },
  { id: "create", label: "Create" },
  { id: "map", label: "Map" },
  { id: "profile", label: "Profile" },
] as const;
