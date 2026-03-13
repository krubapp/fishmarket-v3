"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { ContextTopBar } from "@/components/ContextTopBar";
import { ListingForm } from "@/components/ListingForm";
import { getListing } from "@/lib/firestore";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/lib/routes";
import type { Listing } from "@/lib/schemas/listing";

type EditListingPageProps = { params: Promise<{ id: string }> };

export default function EditListingPage({ params }: EditListingPageProps) {
  const { id: listingId } = use(params);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading || !user) return;

    getListing(listingId)
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
  }, [listingId, user, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="mx-auto flex min-h-dvh max-w-[480px] flex-col border-x border-slate-200 bg-white">
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
