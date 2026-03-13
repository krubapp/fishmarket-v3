"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Snackbar } from "@/components/Snackbar";
import { createPost } from "@/lib/firestore";
import { uploadPostVideo, uploadPostThumbnail } from "@/lib/storage";
import { generateVideoThumbnail } from "@/lib/video";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/lib/routes";
import {
  createPostFormSchema,
  type CreatePostFormData,
} from "@/lib/schemas/post";

import { StepHeader } from "./StepHeader";
import { StepUpload } from "./StepUpload";
import { StepPreview } from "./StepPreview";
import { StepTagLink } from "./StepTagLink";
import { StepSettings } from "./StepSettings";
import type { CreatePostStep } from "./types";

export default function CreatePostPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [step, setStep] = useState<CreatePostStep>(1);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const methods = useForm<CreatePostFormData>({
    resolver: zodResolver(createPostFormSchema),
    defaultValues: {
      caption: "",
      hashtags: [],
      taggedUserIds: [],
      taggedListingIds: [],
      visibility: "everyone",
      allowComments: true,
      allowDuets: true,
      allowDownload: false,
      scheduledAt: null,
    },
  });

  useEffect(() => {
    return () => {
      if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
    };
  }, [videoPreviewUrl]);

  const handleFileSelect = useCallback(
    (file: File) => {
      if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
      setVideoFile(file);
      setVideoPreviewUrl(URL.createObjectURL(file));
      setUploadError(null);
    },
    [videoPreviewUrl],
  );

  const handleRemoveVideo = useCallback(() => {
    if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
    setVideoFile(null);
    setVideoPreviewUrl(null);
  }, [videoPreviewUrl]);

  const goBack = useCallback(() => {
    if (step === 1) {
      router.back();
    } else {
      setStep((s) => (s - 1) as CreatePostStep);
    }
  }, [step, router]);

  const goNext = useCallback(() => {
    setStep((s) => (s + 1) as CreatePostStep);
  }, []);

  const handleClose = useCallback(() => {
    router.push(ROUTES.feed);
  }, [router]);

  const handlePublish = useCallback(async () => {
    if (!user || !videoFile) return;

    const isValid = await methods.trigger();
    if (!isValid) return;

    const data = methods.getValues();
    setSubmitting(true);
    setUploadError(null);

    try {
      const postId = await createPost({
        userId: user.uid,
        videoUrl: "",
        caption: data.caption,
        hashtags: data.hashtags,
        coverFrameColor: null,
        taggedUserIds: data.taggedUserIds,
        taggedListingIds: data.taggedListingIds,
        visibility: data.visibility,
        allowComments: data.allowComments,
        allowDuets: data.allowDuets,
        allowDownload: data.allowDownload,
        scheduledAt: data.scheduledAt,
      });

      const [videoUrl, thumbnailUrl] = await Promise.all([
        uploadPostVideo(videoFile, postId),
        generateVideoThumbnail(videoFile).then((blob) =>
          uploadPostThumbnail(blob, postId),
        ),
      ]);

      const { updateDoc, doc, getFirestore } = await import(
        "firebase/firestore"
      );
      const { firebaseApp } = await import("@/lib/firebase");
      const db = getFirestore(firebaseApp);
      await updateDoc(doc(db, "posts", postId), { videoUrl, thumbnailUrl });

      setShowSuccess(true);
      setTimeout(() => router.push(ROUTES.feed), 1200);
    } catch {
      setUploadError("Failed to create post. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }, [user, videoFile, methods, router]);

  return (
    <FormProvider {...methods}>
      <div className="flex min-h-dvh flex-col bg-surface-page">
        <StepHeader
          step={step}
          onBack={step > 1 ? goBack : undefined}
          onClose={handleClose}
        />

        {step === 1 && (
          <StepUpload
            videoFile={videoFile}
            videoPreviewUrl={videoPreviewUrl}
            onFileSelect={handleFileSelect}
            onRemoveVideo={handleRemoveVideo}
            onNext={goNext}
            error={uploadError}
            onError={setUploadError}
          />
        )}

        {step === 2 && (
          <StepPreview
            videoFile={videoFile}
            videoPreviewUrl={videoPreviewUrl}
            onNext={goNext}
          />
        )}

        {step === 3 && <StepTagLink onNext={goNext} />}

        {step === 4 && (
          <StepSettings
            videoPreviewUrl={videoPreviewUrl}
            onPublish={handlePublish}
            submitting={submitting}
          />
        )}

        {uploadError && step === 4 && (
          <p className="px-6 pb-4 text-center text-sm font-medium text-text-error-default">
            {uploadError}
          </p>
        )}

        <Snackbar
          open={showSuccess}
          onClose={() => setShowSuccess(false)}
          message="Post created!"
          icon="check_circle"
          duration={1200}
        />
      </div>
    </FormProvider>
  );
}
