"use client";

import { useRef, useState, useCallback } from "react";
import { Icon } from "@/components/Icon";

type PromoCard = {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
};

const PROMO_CARDS: PromoCard[] = [
  {
    id: "become-seller",
    title: "Become a lure seller",
    subtitle: "share your lures with the community and get real",
    icon: "currency_exchange",
  },
  {
    id: "best-lures",
    title: "Best lures this season",
    subtitle: "See what anglers are using right now.",
    icon: "currency_exchange",
  },
  {
    id: "best-rig",
    title: "Best Rig Setup for this season",
    subtitle: "see what's working right now",
    icon: "currency_exchange",
  },
];

export type PromoCTASectionProps = {
  className?: string;
};

export function PromoCTASection({ className = "" }: PromoCTASectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = el.scrollWidth / PROMO_CARDS.length;
    setActiveIndex(Math.round(el.scrollLeft / cardWidth));
  }, []);

  return (
    <section className={`flex flex-col gap-2 ${className}`}>
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex snap-x snap-mandatory gap-6 overflow-x-auto scrollbar-none"
      >
        {PROMO_CARDS.map((card) => (
          <button
            key={card.id}
            className="flex w-full shrink-0 snap-center items-center gap-[13px] bg-[#f0f0f0] shadow-[0px_0px_4px_0px_rgba(0,0,0,0.12)] transition-[transform] duration-(--duration-press) ease-(--ease-spring) active:scale-[0.98]"
          >
            <div className="h-[95px] w-[95px] shrink-0 rounded-[2px] bg-slate-200" />
            <div className="flex flex-1 flex-col gap-1 items-start p-2">
              <div className="flex items-start gap-4">
                <span className="font-bold text-[14px] leading-normal text-[#1e1e1e] text-left">
                  {card.title}
                </span>
                <Icon
                  name="currency_exchange"
                  size={20}
                  className="shrink-0 text-[#1e1e1e]"
                />
              </div>
              <span className="font-medium text-[14px] leading-normal text-[#3c3c3c] text-left">
                {card.subtitle}
              </span>
            </div>
          </button>
        ))}
      </div>

      {PROMO_CARDS.length > 1 && (
        <div className="flex items-center justify-center gap-1 py-4">
          {PROMO_CARDS.map((_, i) => (
            <span
              key={i}
              className={`h-0.5 flex-1 max-w-[40px] rounded-full transition-colors ${
                i === activeIndex ? "bg-[#060606]" : "bg-[#a5a5a5]"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
