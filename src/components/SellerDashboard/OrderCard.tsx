"use client";

import { useCallback } from "react";
import { Icon } from "@/components/Icon";
import { Badge } from "@/components/Badge";
import { Link } from "@/components/Link";
import { BorderLine } from "@/components/BorderLine";
import { ImageBlock } from "@/components/ImageBlock";
import type { Order } from "@/lib/schemas/order";
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_BADGE_VARIANT,
} from "@/lib/schemas/order";

export type OrderCardMode = "dashboard" | "detail";

export type OrderCardProps = {
  order: Order;
  mode?: OrderCardMode;
  onDetails?: (order: Order) => void;
  className?: string;
};

function CopyAction({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(value).catch(() => {});
  }, [value]);

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1 self-start transition-[opacity,transform] duration-(--duration-press) ease-(--ease-spring) active:scale-[0.97]"
    >
      <Icon name="content_copy" size={20} className="text-[#024260]" />
      <span className="text-right text-paragraph-sm font-semibold leading-[1.43] text-[#024260]">
        {label}
      </span>
    </button>
  );
}

export function OrderCard({
  order,
  mode = "dashboard",
  onDetails,
  className = "",
}: OrderCardProps) {
  const statusLabel = ORDER_STATUS_LABELS[order.status];
  const badgeVariant = ORDER_STATUS_BADGE_VARIANT[order.status];
  const isDetail = mode === "detail";

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {/* Header: order title + details link */}
      <div className="flex items-start justify-between gap-6">
        <div className="flex flex-col gap-1 py-2">
          <p className="text-[20px] font-medium leading-[28px] text-[#121412]">
            Order #{order.orderNumber}
          </p>
          <p className="text-paragraph-sm font-semibold leading-[1.43] text-[#1e201e]">
            Invoice ID: {order.buyerName}
          </p>
        </div>
        {!isDetail && onDetails && (
          <Link size="small" onClick={() => onDetails(order)}>
            Details
          </Link>
        )}
      </div>

      {/* Detail mode: Customer's name */}
      {isDetail && (
        <div className="flex flex-col gap-1 py-3">
          <p className="text-paragraph-md font-semibold leading-normal text-[#121412]">
            Customer&apos;s name
          </p>
          <p className="text-paragraph-md font-normal leading-normal text-[#1e201e]">
            {order.buyerName}
          </p>
        </div>
      )}

      {/* Detail mode: Contact information */}
      {isDetail && order.buyerEmail && (
        <>
          <BorderLine />
          <div className="flex flex-col gap-1 py-3">
            <p className="text-paragraph-md font-semibold leading-normal text-[#121412]">
              Contact information
            </p>
            <p className="text-paragraph-md font-normal leading-normal text-[#1e201e]">
              {order.buyerEmail}
            </p>
            <CopyAction value={order.buyerEmail} label="Copy email" />
          </div>
        </>
      )}

      {/* Carrier */}
      {order.carrier && (
        <>
          {isDetail && <BorderLine />}
          <div className="flex flex-col py-3">
            <p className="text-paragraph-md font-semibold leading-normal text-[#121412]">
              Carrier
            </p>
            <div className="flex items-center gap-3">
              <p className="text-paragraph-md font-semibold leading-normal text-[#0da5e9]">
                {order.carrier}
              </p>
              <Icon
                name="local_shipping"
                size={24}
                className="text-[#0da5e9]"
              />
            </div>
          </div>
        </>
      )}

      {/* Tracking number + status badge */}
      <div className="flex items-center gap-6 py-3">
        <div className="flex flex-1 flex-col gap-1">
          <p className="text-paragraph-md font-semibold leading-normal text-[#121412]">
            Tracking number
          </p>
          <p className="text-paragraph-md font-normal leading-normal text-[#1e201e]">
            {order.trackingNumber ?? "--"}
          </p>
          {order.trackingNumber && (
            <CopyAction
              value={order.trackingNumber}
              label="Copy address"
            />
          )}
        </div>
        <Badge variant={badgeVariant}>{statusLabel}</Badge>
      </div>

      {/* Detail mode: Shipping and billing address */}
      {isDetail && order.shippingAddress && (
        <>
          <BorderLine />
          <div className="flex flex-col gap-1 py-3">
            <p className="text-paragraph-md font-semibold leading-normal text-[#121412]">
              Shipping and billing address
            </p>
            <p className="whitespace-pre-line text-paragraph-md font-normal leading-normal text-[#1e201e]">
              {order.shippingAddress}
            </p>
            <CopyAction
              value={order.shippingAddress}
              label="Copy address"
            />
          </div>
        </>
      )}

      {/* Detail mode: Products in order */}
      {isDetail && (
        <>
          <BorderLine />
          <div className="flex flex-col gap-4 py-3">
            <p className="text-paragraph-md font-semibold leading-normal text-[#121412]">
              Products in order
            </p>
            <div className="-mx-6 flex gap-4 overflow-x-auto px-6 pb-2">
              <div className="flex shrink-0 flex-col gap-2">
                <ImageBlock
                  size="medium"
                  src={null}
                  alt={order.listingTitle}
                />
                <p className="max-w-[148px] truncate text-paragraph-sm font-medium leading-[1.43] text-[#121412]">
                  {order.listingTitle}
                </p>
                <p className="text-paragraph-sm font-normal leading-[1.43] text-[#1e201e]">
                  {order.currency} {order.unitPrice.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
