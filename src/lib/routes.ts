/**
 * Centralized route definitions for the app.
 * Import ROUTES anywhere you need a path — keeps URLs in one place
 * so renames only require a single change.
 */
export const ROUTES = {
  home: "/",
  login: "/login",
  shop: "/shop",
  createListing: "/create-listing",
  createListingForm: "/create-listing/form",
  editListing: (id: string) => `/create-listing/${id}/edit` as const,
  map: "/map",
  profile: "/profile",
  showcase: "/showcase",
} as const;

export type RoutePath =
  | (typeof ROUTES)[Exclude<keyof typeof ROUTES, "editListing">]
  | ReturnType<typeof ROUTES.editListing>;
