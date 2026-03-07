import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

import { firebaseApp } from "./firebase";

const storage = getStorage(firebaseApp);

export async function uploadListingImages(
  files: File[],
  listingId: string
): Promise<string[]> {
  const urls: string[] = [];
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const ext = file.name.split(".").pop() || "jpg";
    const path = `listings/${listingId}/${Date.now()}-${i}.${ext}`;
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    urls.push(url);
  }
  return urls;
}

/** Upload a single variant value image. Returns the download URL. */
export async function uploadVariantImage(
  file: File,
  listingId: string,
  valueId: string
): Promise<string> {
  const ext = file.name.split(".").pop() || "jpg";
  const path = `listings/${listingId}/variants/${valueId}.${ext}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}
