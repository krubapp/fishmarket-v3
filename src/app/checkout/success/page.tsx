"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/Button";
import { Icon } from "@/components/Icon";
import { useCartContext } from "@/contexts/CartContext";
import { getAuthHeaders } from "@/lib/firebase";
import { ROUTES } from "@/lib/routes";

type OrderDetails = {
  valid: boolean;
  productName: string;
  amount: number;
  currency: string;
  quantity: number;
};

function CheckoutSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const cartContext = useCartContext();
  const sessionId = searchParams.get("session_id");

  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(!!sessionId);
  const [invalid, setInvalid] = useState(!sessionId);

  useEffect(() => {
    if (!sessionId) return;

    async function validate() {
      try {
        const headers = await getAuthHeaders();
        const res = await fetch(
          `/api/stripe/session?session_id=${encodeURIComponent(sessionId!)}`,
          { headers },
        );
        if (!res.ok) {
          setInvalid(true);
          return;
        }
        const data: OrderDetails = await res.json();
        if (!data.valid) {
          setInvalid(true);
          return;
        }
        setOrder(data);
        cartContext?.refresh();
      } catch {
        setInvalid(true);
      } finally {
        setLoading(false);
      }
    }
    validate();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="mx-auto flex min-h-dvh max-w-[480px] items-center justify-center border-x border-slate-200 bg-white">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
      </div>
    );
  }

  if (invalid) {
    return (
      <div className="mx-auto flex min-h-dvh max-w-[480px] flex-col items-center justify-center gap-6 border-x border-slate-200 bg-white p-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <Icon name="error" size={32} className="text-red-700" />
        </div>
        <h1 className="text-center text-(length:--font-size-body-lg) font-semibold text-slate-900">
          Invalid checkout session
        </h1>
        <p className="text-center text-(length:--font-size-body-md) text-grey-800">
          We couldn&apos;t verify this checkout. If you completed a purchase,
          check your orders for confirmation.
        </p>
        <Button
          size="large"
          onClick={() => router.push(ROUTES.home)}
          className="w-full"
        >
          Go Home
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-[480px] flex-col items-center justify-center gap-6 border-x border-slate-200 bg-white p-6">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
        <Icon name="check_circle" size={32} className="text-green-700" />
      </div>
      <h1 className="text-center text-(length:--font-size-body-lg) font-semibold text-slate-900">
        Order placed successfully
      </h1>
      <p className="text-center text-(length:--font-size-body-md) text-grey-800">
        Thank you for your purchase. The seller has been notified and will
        process your order shortly.
      </p>
      {order && (
        <div className="flex w-full flex-col gap-2 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center justify-between">
            <span className="text-paragraph-sm font-medium text-grey-500">
              Item
            </span>
            <span className="text-paragraph-sm font-semibold text-slate-900">
              {order.productName}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-paragraph-sm font-medium text-grey-500">
              Quantity
            </span>
            <span className="text-paragraph-sm font-semibold text-slate-900">
              {order.quantity}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-paragraph-sm font-medium text-grey-500">
              Total
            </span>
            <span className="text-paragraph-sm font-semibold text-slate-900">
              {order.currency}{" "}
              {order.amount.toLocaleString("sv-SE", {
                minimumFractionDigits: 2,
              })}
            </span>
          </div>
        </div>
      )}
      <div className="flex w-full flex-col gap-3">
        <Button
          size="large"
          onClick={() => router.push(ROUTES.home)}
          className="w-full"
        >
          Continue Shopping
        </Button>
        <Button
          size="large"
          variant="outline"
          onClick={() => router.push(ROUTES.profileOrders)}
          className="w-full"
        >
          View Orders
        </Button>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto flex min-h-dvh max-w-[480px] items-center justify-center border-x border-slate-200 bg-white">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
        </div>
      }
    >
      <CheckoutSuccessContent />
    </Suspense>
  );
}
