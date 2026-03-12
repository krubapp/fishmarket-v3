"use client";

import { useFormContext, Controller } from "react-hook-form";
import { Button } from "@/components/Button";
import { Switch } from "@/components/Switch";
import { Checkbox } from "@/components/Checkbox";
import { VISIBILITY_OPTIONS, INTERACTION_SETTINGS } from "@/lib/constants/post";
import type { CreatePostFormData } from "@/lib/schemas/post";

type StepSettingsProps = {
  videoPreviewUrl: string | null;
  onPublish: () => void;
  submitting: boolean;
};

export function StepSettings({
  videoPreviewUrl,
  onPublish,
  submitting,
}: StepSettingsProps) {
  const { watch, setValue, control } = useFormContext<CreatePostFormData>();

  const visibility = watch("visibility");

  return (
    <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-6">
      {/* Video thumbnail preview */}
      {videoPreviewUrl && (
        <div className="h-20 w-20 overflow-hidden rounded-lg bg-surface-default">
          <video
            src={videoPreviewUrl}
            className="h-full w-full object-cover"
            muted
            playsInline
          />
        </div>
      )}

      {/* Who Can Watch */}
      <div className="flex flex-col gap-3">
        <label className="text-[11px] font-semibold uppercase tracking-wider text-text-default-secondary">
          Who Can Watch
        </label>
        <div className="overflow-hidden rounded-xl bg-surface-default">
          {VISIBILITY_OPTIONS.map((opt, i) => {
            const isSelected = visibility === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setValue("visibility", opt.id)}
                className={`flex w-full items-center gap-3 px-4 py-3.5 text-left transition-[background-color,transform] duration-(--duration-press) ease-(--ease-spring) active:scale-[0.98] ${
                  isSelected ? "bg-surface-primary-default-subtle" : "hover:bg-surface-page-secondary"
                } ${i > 0 ? "border-t border-slate-200" : ""}`}
              >
                <span className="text-lg">{opt.emoji}</span>
                <div className="flex flex-1 flex-col">
                  <span
                    className={`text-sm font-semibold ${
                      isSelected ? "text-text-default-headings" : "text-text-default-body"
                    }`}
                  >
                    {opt.label}
                  </span>
                  <span className="text-xs text-text-default-secondary">
                    {opt.description}
                  </span>
                </div>
                <Checkbox
                  checked={isSelected}
                  onChange={() => setValue("visibility", opt.id)}
                  aria-label={opt.label}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactions */}
      <div className="flex flex-col gap-3">
        <label className="text-[11px] font-semibold uppercase tracking-wider text-text-default-secondary">
          Interactions
        </label>
        <div className="overflow-hidden rounded-xl bg-surface-default">
          {INTERACTION_SETTINGS.map((setting, i) => (
            <Controller
              key={setting.id}
              control={control}
              name={setting.id}
              render={({ field }) => (
                <div
                  className={`flex items-center gap-3 px-4 py-3.5 ${
                    i > 0 ? "border-t border-slate-200" : ""
                  }`}
                >
                  <span className="text-lg">{setting.emoji}</span>
                  <div className="flex flex-1 flex-col">
                    <span className="text-sm font-semibold text-text-default-headings">
                      {setting.label}
                    </span>
                    <span className="text-xs text-text-default-secondary">
                      {setting.description}
                    </span>
                  </div>
                  <Switch
                    checked={!!field.value}
                    onChange={(v) => field.onChange(v)}
                    size="small"
                    aria-label={setting.label}
                  />
                </div>
              )}
            />
          ))}
        </div>
      </div>

      {/* Schedule post */}
      <Controller
        control={control}
        name="scheduledAt"
        render={({ field }) => (
          <div className="flex items-center justify-between rounded-xl bg-surface-default px-4 py-3.5">
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-text-default-headings">
                Schedule post
              </span>
              <span className="text-xs text-text-default-secondary">
                Post at a specific time instead
              </span>
            </div>
            {field.value ? (
              <Button
                size="mini"
                variant="transparent"
                onClick={() => field.onChange(null)}
              >
                Clear
              </Button>
            ) : (
              <Button
                size="mini"
                variant="transparent"
                onClick={() => {
                  const tomorrow = new Date();
                  tomorrow.setDate(tomorrow.getDate() + 1);
                  tomorrow.setHours(12, 0, 0, 0);
                  field.onChange(tomorrow.getTime());
                }}
              >
                Set time
              </Button>
            )}
          </div>
        )}
      />

      {/* Publish CTA */}
      <Button
        size="large"
        disabled={submitting}
        loading={submitting}
        onClick={onPublish}
        className="mt-auto w-full"
      >
        Publish Now
      </Button>
    </div>
  );
}
