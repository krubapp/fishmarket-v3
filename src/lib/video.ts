const THUMBNAIL_WIDTH = 480;
const SEEK_TIME = 1;

/**
 * Capture a JPEG thumbnail from a video File using an off-screen
 * <video> + <canvas>. Seeks to `SEEK_TIME` (or 0 for very short clips)
 * and returns a Blob at `THUMBNAIL_WIDTH` px wide, aspect-ratio preserved.
 */
export function generateVideoThumbnail(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    const url = URL.createObjectURL(file);

    video.preload = "metadata";
    video.muted = true;
    video.playsInline = true;
    video.src = url;

    const cleanup = () => URL.revokeObjectURL(url);

    video.addEventListener("loadedmetadata", () => {
      video.currentTime = Math.min(SEEK_TIME, video.duration / 2);
    });

    video.addEventListener("seeked", () => {
      try {
        const scale = THUMBNAIL_WIDTH / video.videoWidth;
        const width = THUMBNAIL_WIDTH;
        const height = Math.round(video.videoHeight * scale);

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          cleanup();
          return reject(new Error("Could not get canvas context"));
        }

        ctx.drawImage(video, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            cleanup();
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error("Canvas toBlob returned null"));
            }
          },
          "image/jpeg",
          0.8,
        );
      } catch (err) {
        cleanup();
        reject(err);
      }
    });

    video.addEventListener("error", () => {
      cleanup();
      reject(new Error("Failed to load video for thumbnail generation"));
    });
  });
}
