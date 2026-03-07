import {
  getFirestore,
  collection,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";

import { firebaseApp } from "./firebase";
import type { Listing } from "./schemas/listing";

const db = getFirestore(firebaseApp);

export const LISTINGS_COLLECTION = "listings";

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
