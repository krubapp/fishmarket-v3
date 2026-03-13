/**
 * Client-side HEIC/HEIF to JPEG conversion for preview and upload.
 * Browsers cannot display HEIC in <img> or createObjectURL; converting
 * to JPEG fixes preview and ensures uploads are in a supported format.
 * Uses heic-to (libheif 1.21+) for better support of newer iPhone HEIC.
 */

import { heicTo, isHeic } from "heic-to";

const HEIC_EXT = /\.heic$/i;
const HEIF_EXT = /\.heif$/i;

/** Sync check by extension/type; for quick filtering before async isHeic. */
export function isHeicFile(file: File): boolean {
  return (
    file.type === "image/heic" ||
    file.type === "image/heif" ||
    HEIC_EXT.test(file.name) ||
    HEIF_EXT.test(file.name)
  );
}

/**
 * Converts a HEIC/HEIF file to a single JPEG File. Non-HEIC files
 * are returned as a single-element array unchanged.
 * Can throw if the format is not supported (e.g. very new codec).
 */
export async function convertHeicToJpegFiles(file: File): Promise<File[]> {
  const isHeicFile = await isHeic(file);
  if (!isHeicFile) {
    return [file];
  }

  const blob = await heicTo({
    blob: file,
    type: "image/jpeg",
    quality: 0.92,
  });

  const baseName = file.name
    .replace(HEIC_EXT, "")
    .replace(HEIF_EXT, "");
  const name = `${baseName}.jpg`;
  return [new File([blob], name, { type: "image/jpeg" })];
}
