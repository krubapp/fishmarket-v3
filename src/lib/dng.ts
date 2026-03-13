/**
 * Client-side DNG (Adobe Digital Negative) to JPEG conversion for preview and upload.
 * Browsers cannot display DNG. Uses UTIF.js to decode embedded previews or
 * decodeable IFDs and convert to JPEG.
 */

import * as UTIF from "utif";

const DNG_EXT = /\.dng$/i;
const DNG_TYPES = [
  "image/x-adobe-dng",
  "image/x-raw-adobe",
  "image/dng",
];

export function isDngFile(file: File): boolean {
  return (
    DNG_TYPES.includes(file.type) || DNG_EXT.test(file.name)
  );
}

/**
 * Collect all IFDs (main + nested subIFDs) for trying decode.
 */
function collectIfds(ifds: UTIF.IFD[]): UTIF.IFD[] {
  const out: UTIF.IFD[] = [];
  for (const ifd of ifds) {
    out.push(ifd);
    const sub = ifd.subIFD;
    if (sub?.length) out.push(...collectIfds(sub));
  }
  return out;
}

/**
 * Converts a DNG file to a single JPEG File. Non-DNG files
 * are returned as a single-element array unchanged.
 * Can throw if the file has no decodeable preview/IFD.
 */
export async function convertDngToJpegFiles(file: File): Promise<File[]> {
  if (!isDngFile(file)) {
    return [file];
  }

  const buffer = await file.arrayBuffer();
  const ifds = UTIF.decode(buffer);
  if (!ifds?.length) {
    throw new Error("DNG: no IFDs");
  }

  const allIfds = collectIfds(ifds);
  let rgba: Uint8Array | null = null;
  let width = 0;
  let height = 0;

  for (const ifd of allIfds) {
    try {
      UTIF.decodeImage(buffer, ifd);
      if (typeof ifd.width !== "number" || typeof ifd.height !== "number" || !ifd.data) {
        continue;
      }
      const decoded = UTIF.toRGBA8(ifd);
      if (decoded?.length) {
        rgba = decoded;
        width = ifd.width;
        height = ifd.height;
        break;
      }
    } catch {
      continue;
    }
  }

  if (!rgba || !width || !height) {
    throw new Error("DNG: no decodeable preview");
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("DNG: no canvas context");
  }

  const imageData = new ImageData(width, height);
  imageData.data.set(new Uint8ClampedArray(rgba));
  ctx.putImageData(imageData, 0, 0);

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, "image/jpeg", 0.92);
  });
  if (!blob) {
    throw new Error("DNG: toBlob failed");
  }

  const baseName = file.name.replace(DNG_EXT, "");
  const name = `${baseName}.jpg`;
  return [new File([blob], name, { type: "image/jpeg" })];
}
