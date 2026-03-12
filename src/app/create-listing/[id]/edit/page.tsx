"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { ContextTopBar } from "@/components/ContextTopBar";
import { ListingForm } from "@/components/ListingForm";
import { getListing } from "@/lib/firestore";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/lib/routes";
import type { Listing } from "@/lib/schemas/listing";

export default function EditListingPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading || !user) return;

    getListing(params.id)
      .then((data) => {
        if (!data || data.sellerId !== user.uid) {
          router.replace(ROUTES.createListing);
          return;
        }
        setListing(data);
        setLoading(false);
      })
      .catch(() => {
        router.replace(ROUTES.createListing);
      });
  }, [params.id, user, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="mx-auto flex min-h-dvh max-w-[440px] flex-col border-x border-slate-200 bg-white">
        <ContextTopBar backLabel="Back" title="Edit listing" onBack={() => router.back()} />
        <div className="flex flex-1 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
        </div>
      </div>
    );
  }

  if (!listing) return null;

  return <ListingForm mode="edit" initialData={listing} />;
}
