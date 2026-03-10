import {
  getFirestore,
  collection,
  addDoc,
  updateDoc,
  setDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";

import { firebaseApp } from "./firebase";
import type { Listing } from "./schemas/listing";

const db = getFirestore(firebaseApp);

export const LISTINGS_COLLECTION = "listings";
export const USERS_COLLECTION = "users";

export type UserProfile = {
  uid: string;
  email: string;
  displayName?: string;
  createdAt?: { seconds: number; nanoseconds: number };
};

export async function createUserProfile(
  uid: string,
  email: string,
  displayName?: string,
): Promise<void> {
  await setDoc(doc(db, USERS_COLLECTION, uid), {
    uid,
    email,
    ...(displayName ? { displayName } : {}),
    createdAt: serverTimestamp(),
  });
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
