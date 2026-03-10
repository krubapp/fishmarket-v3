"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/Button";
import { Icon } from "@/components/Icon";
import { ROUTES } from "@/lib/routes";

export default function CheckoutSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  return (
    <div className="mx-auto flex min-h-dvh max-w-[440px] flex-col items-center justify-center gap-6 border-x border-slate-200 bg-white p-6">
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
      {sessionId && (
        <p className="text-center text-[12px] text-grey-500">
          Session: {sessionId.slice(0, 20)}...
        </p>
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
          onClick={() => router.push(ROUTES.profile)}
          className="w-full"
        >
          View Orders
        </Button>
      </div>
    </div>
  );
}
