"use client";

import { DataItem } from "@/components/DataItem";
import type { SellerAnalytics } from "@/app/api/seller/analytics/route";

export type EarningBalanceSectionProps = {
  analytics: SellerAnalytics | undefined;
  isLoading?: boolean;
  className?: string;
};

function formatBalance(amount: number): string {
  return new Intl.NumberFormat("sv-SE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatCompact(amount: number): string {
  if (amount >= 1000) return `${(amount / 1000).toFixed(0)}k`;
  return amount.toFixed(0);
}

export function EarningBalanceSection({
  analytics,
  isLoading,
  className = "",
}: EarningBalanceSectionProps) {
  const balance = analytics?.earningBalance ?? 0;
  const lifetime = analytics?.lifetimeEarning ?? 0;
  const lastPayout = analytics?.lastPayout ?? 0;
  const nextPayout = analytics?.nextPayout ?? 0;

  return (
    <section
      className={`flex flex-col border-b border-slate-200 bg-slate-100 p-6 ${className}`}
    >
      <div className="flex flex-col gap-1">
        <p className="text-paragraph-md font-medium leading-normal text-[#373a36]">
          Earning balance
        </p>
        {isLoading ? (
          <div className="h-[72px] w-48 animate-pulse rounded bg-slate-200" />
        ) : (
          <p
            className="font-bold leading-[72px] text-[length:var(--h2-text-size,60px)] text-[#121412]"
            style={{
              fontFamily: "'Instrument Sans', sans-serif",
              fontVariationSettings: "'wdth' 100",
            }}
          >
            {formatBalance(balance)}
          </p>
        )}
      </div>

      <div className="flex w-full items-center gap-4">
        <div className="flex-1">
          <DataItem
            label="Life time earning"
            value={isLoading ? undefined : formatCompact(lifetime)}
          />
        </div>
        <div className="flex-1">
          <DataItem
            label="Last payout"
            value={isLoading ? undefined : formatCompact(lastPayout)}
          />
        </div>
        <div className="flex-1">
          <DataItem
            label="Next payout"
            value={isLoading ? undefined : formatCompact(nextPayout)}
          />
        </div>
      </div>
    </section>
  );
}
