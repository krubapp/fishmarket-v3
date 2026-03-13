"use client";

import { useState } from "react";
import { Icon } from "@/components/Icon";
import { getAuthHeaders } from "@/lib/firebase";

export type StripeAccountCardProps = {
  uid?: string;
  stripeOnboardingComplete?: boolean;
  className?: string;
};

export function StripeAccountCard({
  uid,
  stripeOnboardingComplete = false,
  className = "",
}: StripeAccountCardProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConnect() {
    if (!uid || loading) return;
    setLoading(true);
    setError(null);
    try {
      const authHeaders = await getAuthHeaders();
      const res = await fetch("/api/stripe/connect/onboard", {
        method: "POST",
        headers: authHeaders,
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || "Failed to start onboarding");
      }
    } catch {
      setError("Connection failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section
      className={`border-b border-slate-200 bg-white p-6 ${className}`}
    >
      <div
        className="flex flex-col gap-3 overflow-hidden rounded-[12px] p-4 shadow-[0px_1px_4px_0px_rgba(0,0,0,0.17)]"
        style={{
          backgroundImage: stripeOnboardingComplete
            ? "linear-gradient(114deg, rgba(255, 255, 255, 0.5) 6.7%, rgb(209, 250, 229) 96.2%)"
            : "linear-gradient(114deg, rgba(255, 255, 255, 0.5) 6.7%, rgb(216, 241, 255) 96.2%)",
        }}
      >
        <div className="flex flex-col gap-3">
          <p className="text-[24px] font-bold text-[#635bff]">
            Stripe Account
          </p>
          {stripeOnboardingComplete ? (
            <>
              <div className="flex items-center gap-2">
                <Icon
                  name="check_circle"
                  size={20}
                  className="text-green-700"
                />
                <p className="text-[18px] font-bold text-[#0c0c0c]">
                  Account connected
                </p>
              </div>
              <p className="text-[14px] font-medium text-[#121212]">
                Your payment account is verified and ready to receive payouts.
              </p>
            </>
          ) : (
            <>
              <p className="text-[18px] font-bold text-[#0c0c0c]">
                Add payment information
              </p>
              <p className="text-[14px] font-medium text-[#121212]">
                Complete your business details on the Know Your Customer page to
                receive payouts.
              </p>
            </>
          )}
        </div>
        {!stripeOnboardingComplete && (
          <>
            <button
              className="flex items-center gap-1 self-start disabled:opacity-50"
              onClick={handleConnect}
              disabled={loading || !uid}
            >
              <span className="text-[14px] font-normal text-[#0c0c0c]">
                {loading
                  ? "Connecting..."
                  : "Connect to your payment account"}
              </span>
              {!loading && (
                <Icon
                  name="arrow_forward_ios"
                  size={20}
                  className="text-[#0c0c0c]"
                />
              )}
            </button>
            {error && (
              <p className="text-[13px] font-medium text-red-600">{error}</p>
            )}
          </>
        )}
      </div>
    </section>
  );
}
