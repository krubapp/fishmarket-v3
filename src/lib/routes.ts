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
  settings: "/settings",
  settingsGeneral: "/settings/general",
  settingsAccount: "/settings/account",
  searchListings: "/search",
  listingDetail: (id: string) => `/listings/${id}` as const,
  checkoutSuccess: "/checkout/success",
  stripeConnectReturn: "/stripe/connect/return",
} as const;

export type RoutePath =
  | (typeof ROUTES)[Exclude<keyof typeof ROUTES, "editListing" | "listingDetail">]
  | ReturnType<typeof ROUTES.editListing>
  | ReturnType<typeof ROUTES.listingDetail>;
