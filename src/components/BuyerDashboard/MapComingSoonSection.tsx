"use client";

import { Button } from "@/components/Button";

export type MapComingSoonSectionProps = {
  className?: string;
};

export function MapComingSoonSection({
  className = "",
}: MapComingSoonSectionProps) {
  return (
    <section
      className={`flex flex-col border border-slate-200 bg-slate-100 py-6 ${className}`}
    >
      <div className="flex flex-col items-center gap-6 overflow-hidden px-6">
        {/* Top header: eyebrow + title + beta row */}
        <div className="flex w-full max-w-[392px] flex-col gap-3 text-center">
          <p className="font-medium text-[16px] leading-normal text-[#99000c]">
            Near you
          </p>
          <div className="flex flex-col gap-1">
            <p className="font-medium text-[24px] leading-normal text-[#121212]">
              MAPPING AREA COMING SOON
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6">
              <span
                className="inline-flex h-5 items-center justify-center rounded px-3 font-medium text-[14px] leading-[1.43] text-[#024260] bg-[#82c8fe]"
                role="status"
              >
                Beta
              </span>
              <p className="font-medium text-[16px] leading-normal text-[#3c3c3c]">
                Sign up for the beta
              </p>
            </div>
          </div>
        </div>

        {/* Map hero: blurred background + centered CTA */}
        <div className="relative flex min-h-[527px] w-full max-w-[516px] flex-col items-center justify-center overflow-hidden rounded-lg">
          <img
            src="/images/map.png"
            alt=""
            className="absolute inset-0 h-full w-full scale-[1.03] object-cover blur-[2.5px]"
          />
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/40 to-black/80"
            aria-hidden
          />

          <div className="relative flex flex-col items-center justify-center gap-10 px-6 text-center">
            <p className="font-medium text-[34px] leading-normal text-white">
              New area found by
            </p>
            <Button
              size="small"
              variant="subtle"
              trailingIcon="chevron_right"
              className="bg-slate-100 text-slate-900 hover:bg-slate-200 hover:text-slate-950"
            >
              Sign up for beta
            </Button>
          </div>
        </div>
      </div>

      {/* Bottom strip: people in same location */}
      <div className="flex items-center justify-between gap-6 rounded-b-[12px] bg-[#f0f0f0] px-6 py-6">
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <p className="font-semibold text-[16px] leading-normal text-black">
            People who are posting in this same location
          </p>
          <div className="flex items-center">
            <img
              src="/images/mockProfile2.svg"
              alt=""
              className="z-10 h-[34px] w-[34px] shrink-0 rounded-full border border-white object-cover"
            />
            <img
              src="/images/mockProfile3.svg"
              alt=""
              className="-ml-[15px] z-20 h-[34px] w-[34px] shrink-0 rounded-full border border-white object-cover"
            />
            <img
              src="/images/mockProfile4.svg"
              alt=""
              className="-ml-[15px] z-30 h-[34px] w-[34px] shrink-0 rounded-full border border-white object-cover"
            />
            <span className="-ml-[15px] z-40 flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full border border-[#f0f0f0] bg-white font-semibold text-[16px] text-[#330004]">
              25
            </span>
          </div>
        </div>
        <span className="shrink-0 font-medium text-[14px] leading-normal text-[#3c3c3c]">
          View All
        </span>
      </div>
    </section>
  );
}
