"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ContextTopBar } from "@/components/ContextTopBar";
import { Textarea } from "@/components/Textarea";
import { Button } from "@/components/Button";
import { Icon } from "@/components/Icon";
import { Snackbar } from "@/components/Snackbar";
import { createPost } from "@/lib/firestore";
import { uploadPostVideo } from "@/lib/storage";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/lib/routes";

export default function CreatePostPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cleanup object URL on unmount or change
  useEffect(() => {
    return () => {
      if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
    };
  }, [videoPreviewUrl]);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (!file.type.startsWith("video/")) {
        setError("Please select a video file.");
        return;
      }

      // 200MB limit
      if (file.size > 200 * 1024 * 1024) {
        setError("Video must be under 200MB.");
        return;
      }

      if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
      setVideoFile(file);
      setVideoPreviewUrl(URL.createObjectURL(file));
      setError(null);
    },
    [videoPreviewUrl],
  );

  const handleRemoveVideo = useCallback(() => {
    if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
    setVideoFile(null);
    setVideoPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [videoPreviewUrl]);

  const handleSubmit = useCallback(async () => {
    if (!user || !videoFile) return;

    setSubmitting(true);
    setError(null);

    try {
      // Create post doc first to get ID, then upload video
      const postId = await createPost({
        userId: user.uid,
        videoUrl: "",
        caption: caption.trim(),
      });

      const videoUrl = await uploadPostVideo(videoFile, postId);

      // Update post with the video URL
      const { updateDoc, doc, getFirestore } = await import("firebase/firestore");
      const { firebaseApp } = await import("@/lib/firebase");
      const db = getFirestore(firebaseApp);
      await updateDoc(doc(db, "posts", postId), { videoUrl });

      setShowSuccess(true);
      setTimeout(() => router.push(ROUTES.feed), 1200);
    } catch {
      setError("Failed to create post. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }, [user, videoFile, caption, router]);

  return (
    <div className="flex min-h-dvh flex-col bg-white">
      <ContextTopBar
        backLabel="Feed"
        title="New Post"
        onBack={() => router.back()}
      />

      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-6 p-6">
        {/* Video upload area */}
        {videoPreviewUrl ? (
          <div className="relative overflow-hidden rounded-xl bg-black">
            <video
              src={videoPreviewUrl}
              className="max-h-[400px] w-full object-contain"
              controls
              playsInline
              muted
            />
            <button
              type="button"
              onClick={handleRemoveVideo}
              className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 transition-transform duration-(--duration-press) ease-(--ease-spring) active:scale-[0.9]"
              aria-label="Remove video"
            >
              <Icon name="close" size={18} className="text-white" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex min-h-[265px] flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-slate-400 bg-slate-50 p-6 transition-colors hover:border-slate-500 hover:bg-slate-100 active:bg-slate-200"
          >
            <Icon
              name="videocam"
              size={42}
              className="text-slate-400"
            />
            <span className="text-base font-medium text-slate-700">
              Select a video
            </span>
            <span className="text-sm text-slate-500">
              MP4, MOV, WebM - up to 200MB
            </span>
          </button>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          className="hidden"
          onChange={handleFileSelect}
        />

        {/* Caption */}
        <Textarea
          label="Caption"
          placeholder="Write a caption..."
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          rows={3}
          helperText={`${caption.length}/500`}
          error={caption.length > 500}
        />

        {error && (
          <p className="text-sm font-medium text-red-600">{error}</p>
        )}

        {/* Submit */}
        <Button
          size="large"
          onClick={handleSubmit}
          disabled={!videoFile || caption.length > 500}
          loading={submitting}
        >
          Post
        </Button>
      </div>

      <Snackbar
        open={showSuccess}
        onClose={() => setShowSuccess(false)}
        message="Post created!"
        icon="check_circle"
        duration={1200}
      />
    </div>
  );
}
