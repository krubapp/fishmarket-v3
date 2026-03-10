import {
  getFirestore,
  collection,
  addDoc,
  updateDoc,
  setDoc,
  doc,
  getDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  increment,
  serverTimestamp,
  startAfter,
  documentId,
  type DocumentSnapshot,
  type QueryConstraint,
} from "firebase/firestore";

import { firebaseApp } from "./firebase";
import type { Listing } from "./schemas/listing";
import type { Order, OrderStatus } from "./schemas/order";
import type { Post, CreatePostInput } from "./schemas/post";

const db = getFirestore(firebaseApp);

export const LISTINGS_COLLECTION = "listings";
export const USERS_COLLECTION = "users";
export const ORDERS_COLLECTION = "orders";
export const POSTS_COLLECTION = "posts";
export const POST_LIKES_COLLECTION = "post_likes";
export const POST_SAVES_COLLECTION = "post_saves";

export type UserProfile = {
  uid: string;
  email: string;
  displayName?: string;
  username?: string;
  location?: string;
  bio?: string;
  avatarUrl?: string | null;
  followerCount?: number;
  tiktokUrl?: string;
  youtubeUrl?: string;
  instagramUrl?: string;
  isSeller?: boolean;
  stripeAccountId?: string;
  stripeCustomerId?: string;
  stripeOnboardingComplete?: boolean;
  createdAt?: { seconds: number; nanoseconds: number };
};

export async function createUserProfile(
  uid: string,
  email: string,
  displayName?: string,
  isSeller = false,
): Promise<void> {
  await setDoc(doc(db, USERS_COLLECTION, uid), {
    uid,
    email,
    ...(displayName ? { displayName } : {}),
    isSeller,
    createdAt: serverTimestamp(),
  });
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, USERS_COLLECTION, uid));
  if (!snap.exists()) return null;
  return snap.data() as UserProfile;
}

/**
 * Get user profile by username or by uid (document id).
 * Tries document id first, then queries by username.
 */
export async function getUserProfileByUsernameOrId(
  usernameOrId: string,
): Promise<UserProfile | null> {
  const byId = await getDoc(doc(db, USERS_COLLECTION, usernameOrId));
  if (byId.exists()) return byId.data() as UserProfile;
  const q = query(
    collection(db, USERS_COLLECTION),
    where("username", "==", usernameOrId),
    limit(1),
  );
  const snap = await getDocs(q);
  const first = snap.docs[0];
  if (!first) return null;
  return { uid: first.id, ...first.data() } as UserProfile;
}

/** Remove undefined values; Firestore rejects undefined. */
function omitUndefined<T extends Record<string, unknown>>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined),
  ) as Partial<T>;
}

export async function updateUserProfile(
  uid: string,
  data: Partial<Omit<UserProfile, "uid">>,
): Promise<void> {
  await updateDoc(doc(db, USERS_COLLECTION, uid), omitUndefined(data as Record<string, unknown>));
}

export type CreateListingInput = Omit<Listing, "id" | "createdAt">;

export type CreateListingInputInitial = Omit<CreateListingInput, "imageUrls"> & {
  imageUrls?: string[];
};

export async function createListing(
  data: CreateListingInput | CreateListingInputInitial
): Promise<string> {
  const docRef = await addDoc(collection(db, LISTINGS_COLLECTION), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateListing(
  listingId: string,
  data: Partial<CreateListingInput>
): Promise<void> {
  await updateDoc(doc(db, LISTINGS_COLLECTION, listingId), data);
}

export async function getListing(id: string): Promise<Listing | null> {
  const snap = await getDoc(doc(db, LISTINGS_COLLECTION, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Listing;
}

export async function getListings(): Promise<Listing[]> {
  const q = query(
    collection(db, LISTINGS_COLLECTION),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Listing);
}

export async function getUserListings(uid: string): Promise<Listing[]> {
  const q = query(
    collection(db, LISTINGS_COLLECTION),
    where("sellerId", "==", uid),
    orderBy("createdAt", "desc"),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Listing);
}

export async function getSellers(limitCount = 20): Promise<UserProfile[]> {
  const q = query(
    collection(db, USERS_COLLECTION),
    where("isSeller", "==", true),
    limit(limitCount),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as UserProfile);
}

export async function getNewReleases(limitCount = 10): Promise<Listing[]> {
  const q = query(
    collection(db, LISTINGS_COLLECTION),
    orderBy("createdAt", "desc"),
    limit(limitCount),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Listing);
}

export async function getListingsByFishType(
  fishType: string,
  limitCount = 20,
): Promise<Listing[]> {
  const q = query(
    collection(db, LISTINGS_COLLECTION),
    where("fishType", "==", fishType),
    limit(limitCount),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Listing);
}

// ─── Search / filter ────────────────────────────────────────────────────

export type ListingFilters = {
  category?: string;
  fishType?: string;
  condition?: string;
  sellerId?: string;
  searchQuery?: string;
  minPrice?: number;
  maxPrice?: number;
};

export async function searchListings(
  filters: ListingFilters,
): Promise<Listing[]> {
  const constraints: QueryConstraint[] = [];

  if (filters.category) constraints.push(where("category", "==", filters.category));
  if (filters.fishType) constraints.push(where("fishType", "==", filters.fishType));
  if (filters.condition) constraints.push(where("condition", "==", filters.condition));
  if (filters.sellerId) constraints.push(where("sellerId", "==", filters.sellerId));

  constraints.push(orderBy("createdAt", "desc"));

  const q = query(collection(db, LISTINGS_COLLECTION), ...constraints);
  const snap = await getDocs(q);
  let results = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Listing);

  if (filters.searchQuery) {
    const lower = filters.searchQuery.toLowerCase();
    results = results.filter((l) => l.title.toLowerCase().includes(lower));
  }
  if (filters.minPrice != null) {
    results = results.filter((l) => l.price >= filters.minPrice!);
  }
  if (filters.maxPrice != null) {
    results = results.filter((l) => l.price <= filters.maxPrice!);
  }

  return results;
}

/** Batch-fetch user profiles by UID (groups of 10 for Firestore `in` limit). */
export async function getUserProfiles(
  uids: string[],
): Promise<Map<string, UserProfile>> {
  const map = new Map<string, UserProfile>();
  const unique = [...new Set(uids)];
  if (unique.length === 0) return map;

  for (let i = 0; i < unique.length; i += 10) {
    const batch = unique.slice(i, i + 10);
    const q = query(
      collection(db, USERS_COLLECTION),
      where(documentId(), "in", batch),
    );
    const snap = await getDocs(q);
    snap.docs.forEach((d) => map.set(d.id, d.data() as UserProfile));
  }

  return map;
}

// ─── Orders ────────────────────────────────────────────────────────────

export type CreateOrderInput = Omit<Order, "id" | "createdAt" | "updatedAt">;

export async function createOrder(data: CreateOrderInput): Promise<string> {
  const docRef = await addDoc(collection(db, ORDERS_COLLECTION), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function getSellerOrders(
  sellerId: string,
  limitCount = 50,
): Promise<Order[]> {
  const q = query(
    collection(db, ORDERS_COLLECTION),
    where("sellerId", "==", sellerId),
    orderBy("createdAt", "desc"),
    limit(limitCount),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Order);
}

export async function updateOrder(
  orderId: string,
  data: Partial<CreateOrderInput>,
): Promise<void> {
  await updateDoc(doc(db, ORDERS_COLLECTION, orderId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function getOrdersByStatus(
  sellerId: string,
  status: OrderStatus,
  limitCount = 50,
): Promise<Order[]> {
  const q = query(
    collection(db, ORDERS_COLLECTION),
    where("sellerId", "==", sellerId),
    where("status", "==", status),
    orderBy("createdAt", "desc"),
    limit(limitCount),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Order);
}

// ─── Posts ─────────────────────────────────────────────────────────────

export async function createPost(data: CreatePostInput): Promise<string> {
  const docRef = await addDoc(collection(db, POSTS_COLLECTION), {
    ...data,
    likeCount: 0,
    saveCount: 0,
    commentCount: 0,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function getFeedPosts(
  limitCount = 10,
  afterDoc?: DocumentSnapshot,
): Promise<{ posts: Post[]; lastDoc: DocumentSnapshot | null }> {
  const constraints = [
    orderBy("createdAt", "desc"),
    ...(afterDoc ? [startAfter(afterDoc)] : []),
    limit(limitCount),
  ];
  const q = query(collection(db, POSTS_COLLECTION), ...constraints);
  const snap = await getDocs(q);
  const posts = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Post);
  const lastDoc = snap.docs[snap.docs.length - 1] ?? null;
  return { posts, lastDoc };
}

export async function getPost(id: string): Promise<Post | null> {
  const snap = await getDoc(doc(db, POSTS_COLLECTION, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Post;
}

function postLikeDocId(postId: string, userId: string) {
  return `${postId}_${userId}`;
}

/** Toggle like — returns true if now liked, false if unliked. */
export async function togglePostLike(
  postId: string,
  userId: string,
): Promise<boolean> {
  const likeId = postLikeDocId(postId, userId);
  const likeRef = doc(db, POST_LIKES_COLLECTION, likeId);
  const snap = await getDoc(likeRef);

  if (snap.exists()) {
    await deleteDoc(likeRef);
    await updateDoc(doc(db, POSTS_COLLECTION, postId), {
      likeCount: increment(-1),
    });
    return false;
  }

  await setDoc(likeRef, { postId, userId, createdAt: serverTimestamp() });
  await updateDoc(doc(db, POSTS_COLLECTION, postId), {
    likeCount: increment(1),
  });
  return true;
}

/** Toggle save — returns true if now saved, false if unsaved. */
export async function togglePostSave(
  postId: string,
  userId: string,
): Promise<boolean> {
  const saveId = postLikeDocId(postId, userId);
  const saveRef = doc(db, POST_SAVES_COLLECTION, saveId);
  const snap = await getDoc(saveRef);

  if (snap.exists()) {
    await deleteDoc(saveRef);
    await updateDoc(doc(db, POSTS_COLLECTION, postId), {
      saveCount: increment(-1),
    });
    return false;
  }

  await setDoc(saveRef, { postId, userId, createdAt: serverTimestamp() });
  await updateDoc(doc(db, POSTS_COLLECTION, postId), {
    saveCount: increment(1),
  });
  return true;
}

/** Batch-check which posts the user has liked and saved. */
export async function getUserPostInteractions(
  postIds: string[],
  userId: string,
): Promise<{ liked: Set<string>; saved: Set<string> }> {
  if (postIds.length === 0) return { liked: new Set(), saved: new Set() };

  const likeIds = postIds.map((pid) => postLikeDocId(pid, userId));
  const saveIds = postIds.map((pid) => postLikeDocId(pid, userId));

  const [likeSnaps, saveSnaps] = await Promise.all([
    Promise.all(likeIds.map((id) => getDoc(doc(db, POST_LIKES_COLLECTION, id)))),
    Promise.all(saveIds.map((id) => getDoc(doc(db, POST_SAVES_COLLECTION, id)))),
  ]);

  const liked = new Set<string>();
  const saved = new Set<string>();

  likeSnaps.forEach((snap, i) => {
    if (snap.exists()) liked.add(postIds[i]);
  });
  saveSnaps.forEach((snap, i) => {
    if (snap.exists()) saved.add(postIds[i]);
  });

  return { liked, saved };
}
