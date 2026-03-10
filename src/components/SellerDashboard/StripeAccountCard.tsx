"use client";

import { Icon } from "@/components/Icon";

export type StripeAccountCardProps = {
  className?: string;
};

export function StripeAccountCard({ className = "" }: StripeAccountCardProps) {
  return (
    <section
      className={`border-b border-slate-200 bg-white p-6 ${className}`}
    >
      <div
        className="flex flex-col gap-3 overflow-hidden rounded-[12px] p-4 shadow-[0px_1px_4px_0px_rgba(0,0,0,0.17)]"
        style={{
          backgroundImage:
            "linear-gradient(114deg, rgba(255, 255, 255, 0.5) 6.7%, rgb(216, 241, 255) 96.2%)",
        }}
      >
        <div className="flex flex-col gap-3">
          <p className="text-[24px] font-bold text-[#635bff]">
            Stripe Account
          </p>
          <p className="text-[18px] font-bold text-[#0c0c0c]">
            Add payment information
          </p>
          <p className="text-[14px] font-medium text-[#121212]">
            Complete your business details on the Know Your Customer page to
            receive payouts.
          </p>
        </div>
        <button className="flex items-center gap-1 self-start">
          <span className="text-[14px] font-normal text-[#0c0c0c]">
            Connect to your payment account
          </span>
          <Icon name="arrow_forward_ios" size={20} className="text-[#0c0c0c]" />
        </button>
      </div>
    </section>
  );
}
