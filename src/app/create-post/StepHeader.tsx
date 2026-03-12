"use client";

import { IconButton } from "@/components/IconButton";
import type { CreatePostStep } from "./types";
import { STEP_TITLES, TOTAL_STEPS } from "./types";

type StepHeaderProps = {
  step: CreatePostStep;
  onBack?: () => void;
  onClose: () => void;
};

export function StepHeader({ step, onBack, onClose }: StepHeaderProps) {
  return (
    <header className="relative flex h-20 shrink-0 items-center justify-between px-6">
      <div className="z-10 w-10">
        {onBack && (
          <IconButton
            name="chevron_left"
            size="large"
            variant="transparent"
            onClick={onBack}
            aria-label="Back"
          />
        )}
      </div>

      <div className="absolute inset-x-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-base font-semibold text-text-default-headings">
          {STEP_TITLES[step]}
        </span>
        <span className="text-xs text-text-default-secondary">
          Step {step} of {TOTAL_STEPS}
        </span>
      </div>

      <div className="z-10 w-10">
        <IconButton
          name="close"
          size="large"
          variant="transparent"
          onClick={onClose}
          aria-label="Close"
        />
      </div>
    </header>
  );
}
