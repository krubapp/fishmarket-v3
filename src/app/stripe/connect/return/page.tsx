"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/Button";
import { Icon } from "@/components/Icon";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/lib/routes";

function StripeConnectReturnContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const isRefresh = searchParams.get("refresh") === "true";

  const [status, setStatus] = useState<"loading" | "verified" | "pending">(
    "loading",
  );

  useEffect(() => {
    if (!user) return;

    async function checkStatus() {
      try {
        const res = await fetch(
          `/api/stripe/connect/status?uid=${user!.uid}`,
        );
        const data = await res.json();
        setStatus(data.verified ? "verified" : "pending");
      } catch {
        setStatus("pending");
      }
    }
    checkStatus();
  }, [user]);

  if (isRefresh) {
    return (
      <div className="mx-auto flex min-h-dvh max-w-[440px] flex-col items-center justify-center gap-6 border-x border-slate-200 bg-white p-6">
        <Icon name="refresh" size={48} className="text-slate-400" />
        <h1 className="text-center text-(length:--font-size-body-lg) font-semibold text-slate-900">
          Onboarding incomplete
        </h1>
        <p className="text-center text-(length:--font-size-body-md) text-grey-800">
          Your Stripe account setup was not completed. Please try again from
          your dashboard.
        </p>
        <Button size="large" onClick={() => router.push(ROUTES.home)}>
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-[440px] flex-col items-center justify-center gap-6 border-x border-slate-200 bg-white p-6">
      {status === "loading" ? (
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
      ) : status === "verified" ? (
        <>
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <Icon name="check_circle" size={32} className="text-green-700" />
          </div>
          <h1 className="text-center text-(length:--font-size-body-lg) font-semibold text-slate-900">
            Payment account connected
          </h1>
          <p className="text-center text-(length:--font-size-body-md) text-grey-800">
            Your Stripe account is verified and ready to receive payments.
          </p>
        </>
      ) : (
        <>
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100">
            <Icon name="schedule" size={32} className="text-yellow-700" />
          </div>
          <h1 className="text-center text-(length:--font-size-body-lg) font-semibold text-slate-900">
            Verification pending
          </h1>
          <p className="text-center text-(length:--font-size-body-md) text-grey-800">
            Your account details have been submitted. Stripe is reviewing your
            information and will verify shortly.
          </p>
        </>
      )}
      <Button size="large" onClick={() => router.push(ROUTES.home)}>
        Back to Dashboard
      </Button>
    </div>
  );
}

export default function StripeConnectReturnPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto flex min-h-dvh max-w-[440px] items-center justify-center border-x border-slate-200 bg-white">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
        </div>
      }
    >
      <StripeConnectReturnContent />
    </Suspense>
  );
}
