/**
 * Centralized route definitions for the app.
 * Import ROUTES anywhere you need a path — keeps URLs in one place
 * so renames only require a single change.
 */
export const ROUTES = {
  home: "/",
  login: "/login",
  shop: "/shop",
  feed: "/feed",
  createPost: "/create-post",
  postDetail: (id: string) => `/feed/${id}` as const,
  createListing: "/create-listing",
  createListingForm: "/create-listing/form",
  editListing: (id: string) => `/create-listing/${id}/edit` as const,
  map: "/map",
  profile: "/profile",
  profileByUsername: (username: string) =>
    `/profile/${encodeURIComponent(username)}` as const,
  profileOrders: "/profile/orders",
  profileFavorites: "/profile/favorites",
  profileComments: "/profile/comments",
  profileCollections: "/profile/collections",
  profileCollectionDetail: (id: string) =>
    `/profile/collections/${id}` as const,
  showcase: "/showcase",
  settings: "/settings",
  settingsGeneral: "/settings/general",
  settingsAccount: "/settings/account",
  listingDetail: (id: string) => `/listings/${id}` as const,
  checkoutSuccess: "/checkout/success",
  stripeConnectReturn: "/stripe/connect/return",
} as const;

export type RoutePath =
  | (typeof ROUTES)[Exclude<
      keyof typeof ROUTES,
      | "editListing"
      | "listingDetail"
      | "postDetail"
      | "profileByUsername"
      | "profileCollectionDetail"
    >]
  | ReturnType<typeof ROUTES.editListing>
  | ReturnType<typeof ROUTES.listingDetail>
  | ReturnType<typeof ROUTES.postDetail>
  | ReturnType<typeof ROUTES.profileByUsername>
  | ReturnType<typeof ROUTES.profileCollectionDetail>;
