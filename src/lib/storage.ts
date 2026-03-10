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

/** Upload a user avatar image. Overwrites any previous avatar. */
export async function uploadAvatar(file: File, uid: string): Promise<string> {
  const ext = file.name.split(".").pop() || "jpg";
  const path = `users/${uid}/avatar.${ext}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
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

/** Upload a post video. Returns the download URL. */
export async function uploadPostVideo(
  file: File,
  postId: string
): Promise<string> {
  const ext = file.name.split(".").pop() || "mp4";
  const path = `posts/${postId}/video.${ext}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}
