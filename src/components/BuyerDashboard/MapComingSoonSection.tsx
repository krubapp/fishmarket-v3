"use client";


export type MapComingSoonSectionProps = {
  className?: string;
};

export function MapComingSoonSection({
  className = "",
}: MapComingSoonSectionProps) {
  return (
    <section className={`flex flex-col ${className}`}>
      <div className="flex flex-col overflow-hidden border-y border-[#E2E8F0] bg-white">
        <div className="flex items-start gap-2.5 px-6 pt-5 pb-4">
          <div className="flex min-w-0 flex-1 flex-col gap-3">
            <p className="font-medium text-[16px] leading-normal text-[#99000c]">
              Near By you
            </p>
            <div className="flex flex-col gap-1">
              <p className="font-medium text-[24px] leading-[1.2] text-[#121212]">
                New Location found
              </p>
              <p className="font-medium text-[16px] leading-normal text-[#3c3c3c]">
                People are posting this location
              </p>
            </div>
          </div>
          <span className="shrink-0 pt-8 font-medium text-[14px] leading-normal text-[#3c3c3c]">
            View All
          </span>
        </div>

        <div className="relative flex min-h-[520px] w-full flex-col items-center justify-center overflow-hidden bg-[#3a3a3a]">
          <img
            src="/images/map.png"
            alt=""
            className="absolute inset-0 h-full w-full object-cover blur-[2.5px] scale-[1.03]"
          />
          <div className="absolute inset-0 bg-linear-to-b from-black/40 to-black/80" />

          <div className="relative flex flex-col items-center gap-10 px-6 text-center">
            <p className="font-medium text-[34px] leading-normal text-white">
              New Area found by
            </p>

            <div className="flex flex-col items-center gap-6">
              <img
                src="/images/mockProfile1.svg"
                alt="Zola Drages"
                className="h-[54px] w-[54px] rounded-full object-cover"
              />
              <div className="flex flex-col items-center gap-1 text-white">
                <p className="font-bold text-[24px] leading-normal">
                  Zola Drages
                </p>
                <p className="font-medium text-[14px] leading-normal">
                  @ZolaDrages
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <span className="rounded-full bg-[#ff0014] px-4 py-2 font-semibold text-[14px] leading-normal text-[#fff4f5]">
                Explore Map
              </span>
              <span className="rounded-full bg-[#f0f0f0] px-4 py-2 font-semibold text-[14px] leading-normal text-[#060606]">
                View Page
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-6 bg-[#f0f0f0] px-6 py-6">
          <div className="flex min-w-0 flex-col gap-3">
            <p className="font-semibold text-[16px] leading-normal text-black">
              People that are posting in this same location
            </p>
            <div className="flex items-center">
              <img src="/images/mockProfile2.svg" alt="" className="z-10 h-[34px] w-[34px] rounded-full border border-white object-cover" />
              <img src="/images/mockProfile3.svg" alt="" className="-ml-[15px] z-20 h-[34px] w-[34px] rounded-full border border-white object-cover" />
              <img src="/images/mockProfile4.svg" alt="" className="-ml-[15px] z-30 h-[34px] w-[34px] rounded-full border border-white object-cover" />
              <span className="-ml-[15px] z-40 inline-flex h-[34px] w-[34px] items-center justify-center rounded-full border border-[#f0f0f0] bg-white font-semibold text-[16px] text-[#330004]">
                25
              </span>
            </div>
          </div>
          <span className="shrink-0 font-medium text-[14px] leading-normal text-[#3c3c3c]">
            View All
          </span>
        </div>
      </div>
    </section>
  );
}
