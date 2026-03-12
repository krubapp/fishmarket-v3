"use client";

import { useRef, useCallback } from "react";
import { Icon } from "@/components/Icon";
import { IconButton } from "@/components/IconButton";
import { Button } from "@/components/Button";

type StepUploadProps = {
  videoFile: File | null;
  videoPreviewUrl: string | null;
  onFileSelect: (file: File) => void;
  onRemoveVideo: () => void;
  onNext: () => void;
  error: string | null;
  onError: (msg: string | null) => void;
};

export function StepUpload({
  videoFile,
  videoPreviewUrl,
  onFileSelect,
  onRemoveVideo,
  onNext,
  error,
  onError,
}: StepUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (!file.type.startsWith("video/")) {
        onError("Please select a video file.");
        return;
      }

      if (file.size > 200 * 1024 * 1024) {
        onError("Video must be under 200MB.");
        return;
      }

      onError(null);
      onFileSelect(file);
    },
    [onFileSelect, onError],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (!file) return;

      if (!file.type.startsWith("video/")) {
        onError("Please select a video file.");
        return;
      }

      if (file.size > 200 * 1024 * 1024) {
        onError("Video must be under 200MB.");
        return;
      }

      onError(null);
      onFileSelect(file);
    },
    [onFileSelect, onError],
  );

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      {videoPreviewUrl && videoFile ? (
        <div className="relative overflow-hidden rounded-2xl bg-surface-default">
          <video
            src={videoPreviewUrl}
            className="max-h-[400px] w-full object-contain"
            controls
            playsInline
            muted
          />
          <div className="absolute right-3 top-3">
            <IconButton
              name="close"
              size="small"
              variant="default"
              onClick={onRemoveVideo}
              aria-label="Remove video"
            />
          </div>
          <div className="p-4">
            <p className="truncate text-sm text-text-default-caption">{videoFile.name}</p>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="flex min-h-[320px] flex-1 flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-slate-300 bg-surface-default p-6 transition-colors hover:border-slate-400 hover:bg-surface-primary-subtle-hover active:bg-surface-primary-subtle-hover"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-primary-default-subtle">
            <Icon name="videocam" size={32} className="text-text-default-secondary" />
          </div>
          <span className="text-base font-medium text-text-default-headings">
            Select a video
          </span>
          <span className="text-sm text-text-default-secondary">
            Drag & drop or tap to browse. MP4, MOV, WebM — up to 200MB
          </span>
        </button>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {error && (
        <p className="text-center text-sm font-medium text-text-error-default">{error}</p>
      )}

      <Button
        size="large"
        disabled={!videoFile}
        onClick={onNext}
        className="mt-auto w-full"
      >
        Next: Preview & Caption
      </Button>
    </div>
  );
}
