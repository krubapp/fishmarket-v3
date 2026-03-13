/**
 * Client-side HEIC/HEIF to JPEG conversion for preview and upload.
 * Browsers cannot display HEIC in <img> or createObjectURL; converting
 * to JPEG fixes preview and ensures uploads are in a supported format.
 */

import heic2any from "heic2any";

const HEIC_TYPES = ["image/heic", "image/heif"];
const HEIC_EXT = /\.heic$/i;

export function isHeicFile(file: File): boolean {
  return (
    HEIC_TYPES.includes(file.type) || HEIC_EXT.test(file.name)
  );
}

/**
 * Converts a HEIC/HEIF file to one or more JPEG Files. Non-HEIC files
 * are returned as a single-element array unchanged.
 */
export async function convertHeicToJpegFiles(file: File): Promise<File[]> {
  if (!isHeicFile(file)) {
    return [file];
  }

  const result = await heic2any({
    blob: file,
    toType: "image/jpeg",
    quality: 0.92,
  });

  const blobs = Array.isArray(result) ? result : [result];
  const baseName = file.name.replace(HEIC_EXT, "").replace(/\.heif$/i, "");

  return blobs.map((blob, i) => {
    const name =
      blobs.length > 1 ? `${baseName}-${i + 1}.jpg` : `${baseName}.jpg`;
    return new File([blob], name, { type: "image/jpeg" });
  });
}
