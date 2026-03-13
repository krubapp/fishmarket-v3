/**
 * Unified conversion for image uploads: HEIC and DNG are converted to JPEG
 * so preview and upload work in the browser. Other files are returned unchanged.
 */

import { convertHeicToJpegFiles, isHeicFile } from "@/lib/heic";
import { convertDngToJpegFiles, isDngFile } from "@/lib/dng";

/**
 * Converts a file to JPEG if it is HEIC or DNG; otherwise returns [file] unchanged.
 * Can throw for unsupported HEIC/DNG variants.
 */
export async function convertToJpegForUpload(file: File): Promise<File[]> {
  if (isHeicFile(file)) {
    return convertHeicToJpegFiles(file);
  }
  if (isDngFile(file)) {
    return convertDngToJpegFiles(file);
  }
  return [file];
}
