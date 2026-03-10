"use client";

import { Link } from "@/components/Link";
import { BorderLine } from "@/components/BorderLine";
import { OrderCard } from "./OrderCard";
import type { Order } from "@/lib/schemas/order";

export type OrdersSectionProps = {
  orders: Order[];
  isLoading?: boolean;
  onViewAll?: () => void;
  onOrderDetails?: (order: Order) => void;
  className?: string;
};

export function OrdersSection({
  orders,
  isLoading,
  onViewAll,
  onOrderDetails,
  className = "",
}: OrdersSectionProps) {
  const isEmpty = !isLoading && orders.length === 0;

  return (
    <section
      className={`flex flex-col border-b border-slate-200 bg-white px-6 py-12 ${className}`}
    >
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-start gap-6 border-b border-slate-200 pb-6">
          <div className="flex flex-1 flex-col">
            <p className="text-[24px] font-medium leading-[32px] text-[#121412]">
              Order
            </p>
            <p className="text-paragraph-md font-normal leading-normal text-[#1e201e]">
              Manage customer purchase and fulfillment
            </p>
          </div>
          {onViewAll && (
            <Link size="medium" onClick={onViewAll}>
              View All
            </Link>
          )}
        </div>

        {/* Content */}
        {isLoading && (
          <div className="flex flex-col gap-4">
            {[0, 1].map((i) => (
              <div
                key={i}
                className="h-32 animate-pulse rounded bg-slate-100"
              />
            ))}
          </div>
        )}

        {isEmpty && (
          <div className="flex flex-col gap-1 py-2">
            <p className="text-[16px] font-semibold leading-normal text-[#121412]">
              No Items
            </p>
            <p className="text-paragraph-sm font-semibold leading-[1.43] text-[#1e201e]">
              --
            </p>
          </div>
        )}

        {!isLoading && orders.length > 0 && (
          <div className="flex flex-col gap-3">
            {orders.map((order, index) => (
              <div key={order.id ?? index}>
                <OrderCard order={order} onDetails={onOrderDetails} />
                {index < orders.length - 1 && (
                  <BorderLine className="mt-3" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
