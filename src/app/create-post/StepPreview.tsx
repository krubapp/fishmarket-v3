"use client";

import { useCallback } from "react";
import { useFormContext, Controller } from "react-hook-form";
import { Button } from "@/components/Button";
import { TRENDING_HASHTAGS, COVER_FRAME_COLORS } from "@/lib/constants/post";
import type { CreatePostFormData } from "@/lib/schemas/post";

type StepPreviewProps = {
  videoFile: File | null;
  videoPreviewUrl: string | null;
  onNext: () => void;
};

export function StepPreview({
  videoFile,
  videoPreviewUrl,
  onNext,
}: StepPreviewProps) {
  const { register, watch, setValue, control } =
    useFormContext<CreatePostFormData>();

  const caption = watch("caption");
  const hashtags = watch("hashtags");
  const coverFrameColor = watch("coverFrameColor");

  const toggleHashtag = useCallback(
    (tag: string) => {
      const current = hashtags ?? [];
      if (current.includes(tag)) {
        setValue(
          "hashtags",
          current.filter((t) => t !== tag),
        );
      } else {
        setValue("hashtags", [...current, tag]);
      }
    },
    [hashtags, setValue],
  );

  return (
    <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-6">
      {/* Video preview */}
      {videoPreviewUrl && (
        <div
          className="relative overflow-hidden rounded-2xl"
          style={{
            borderColor: coverFrameColor ?? "transparent",
            borderWidth: coverFrameColor ? 3 : 0,
            borderStyle: "solid",
          }}
        >
          <video
            src={videoPreviewUrl}
            className="max-h-[280px] w-full object-contain bg-black"
            controls
            playsInline
            muted
          />
          {/* Filename overlay */}
          <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between bg-linear-to-t from-black/60 to-transparent px-4 pb-3 pt-8">
            <span className="truncate text-xs text-white/80">
              {videoFile?.name}
            </span>
          </div>
        </div>
      )}

      {/* Caption */}
      <div className="flex flex-col gap-2">
        <label className="text-[11px] font-semibold uppercase tracking-wider text-text-default-secondary">
          Caption
        </label>
        <div className="rounded-xl bg-surface-default p-4">
          <textarea
            {...register("caption")}
            placeholder="Write something about your video... use # for hashtags"
            maxLength={300}
            rows={3}
            className="w-full resize-none bg-transparent text-sm leading-relaxed text-text-default-body placeholder:text-text-default-placeholder focus:outline-none"
          />
          <p className="mt-1 text-right text-xs text-text-default-placeholder">
            {(caption ?? "").length}/300
          </p>
        </div>
      </div>

      {/* Trending Hashtags */}
      <div className="flex flex-col gap-3">
        <label className="text-[11px] font-semibold uppercase tracking-wider text-text-default-secondary">
          Trending Hashtags
        </label>
        <div className="flex flex-wrap gap-2">
          {TRENDING_HASHTAGS.map((tag) => {
            const isSelected = (hashtags ?? []).includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => toggleHashtag(tag)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
                  isSelected
                    ? "bg-surface-primary-default text-text-on-color-headings"
                    : "bg-surface-default text-text-default-caption hover:bg-surface-primary-subtle-hover"
                }`}
              >
                {tag}
              </button>
            );
          })}
        </div>
      </div>

      {/* Cover Frame Color */}
      <Controller
        control={control}
        name="coverFrameColor"
        render={({ field }) => (
          <div className="flex flex-col gap-3">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-text-default-secondary">
              Cover Frame
            </label>
            <div className="flex gap-3 overflow-x-auto p-2">
              {COVER_FRAME_COLORS.map((c) => {
                const isSelected = field.value === c.hex;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() =>
                      field.onChange(isSelected ? null : c.hex)
                    }
                    className={`h-16 w-16 shrink-0 rounded-lg transition-all ${
                      isSelected
                        ? "ring-2 ring-slate-900 ring-offset-2 ring-offset-white"
                        : "ring-1 ring-slate-200"
                    }`}
                    style={{ backgroundColor: c.hex }}
                    aria-label={c.label}
                  />
                );
              })}
            </div>
          </div>
        )}
      />

      <Button
        size="large"
        onClick={onNext}
        className="mt-auto w-full"
      >
        Next: Tag & Link
      </Button>
    </div>
  );
}
