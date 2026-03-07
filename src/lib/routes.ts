/**
 * Centralized route definitions for the app.
 * Import ROUTES anywhere you need a path — keeps URLs in one place
 * so renames only require a single change.
 */
export const ROUTES = {
  home: "/",
  shop: "/shop",
  createListing: "/create-listing",
  createListingForm: "/create-listing/form",
  map: "/map",
  profile: "/profile",
} as const;

export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES];
