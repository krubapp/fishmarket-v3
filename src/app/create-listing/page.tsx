"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { ImageBlock } from "@/components/ImageBlock";
import { Button } from "@/components/Button";
import { BottomNav } from "@/components/BottomNav";
import { SectionLine } from "@/components/SectionLine";
import { ListingItem } from "@/components/ListingItem";
import { getUserListings } from "@/lib/firestore";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/lib/routes";
import type { Listing } from "@/lib/schemas/listing";

function getVariantCount(listing: Listing): number {
  if (!listing.variants?.length) return 0;
  return listing.variants.reduce((sum, g) => sum + g.values.length, 0);
}

export default function CreateListingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);

  useEffect(() => {
    if (!user) return;
    getUserListings(user.uid).then(setListings).catch(console.error);
  }, [user]);

  const count = listings.length;
  const showImageGrid = count <= 2;

  return (
    <div className="mx-auto flex min-h-dvh max-w-[440px] flex-col bg-white pb-[120px]">
      {showImageGrid && (
        <div className="flex-1 overflow-hidden">
          <div className="flex justify-center gap-4">
            <div className="flex shrink-0 flex-col gap-4 -translate-y-[50px]">
              <ImageBlock size="medium" />
              <ImageBlock size="medium" />
              <ImageBlock size="medium" />
            </div>
            <div className="flex shrink-0 flex-col gap-4 translate-y-[58px]">
              <ImageBlock size="medium" />
              <ImageBlock size="medium" />
            </div>
            <div className="flex shrink-0 flex-col gap-4 -translate-y-[50px]">
              <ImageBlock size="medium" />
              <ImageBlock size="medium" />
              <ImageBlock size="medium" />
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col items-start gap-6 px-6 py-10">
        <div className="flex flex-col gap-1">
          <h2 className="font-medium text-text-default-headings text-paragraph-xl leading-(--line-height-h6)">
            Create a new product inventory
          </h2>
          <p className="font-medium text-text-default-body text-paragraph-md leading-(--line-height-paragraph-md)">
            Add and manage your listings in one place
          </p>
        </div>
        <Button onClick={() => router.push(ROUTES.createListingForm)}>
          Create
        </Button>
      </div>

      {count > 0 && (
        <>
          <SectionLine />
          <div className="flex flex-col px-6 pt-10">
            {listings.map((listing) => {
              const variantCount = getVariantCount(listing);
              return (
                <ListingItem
                  key={listing.id}
                  imageSrc={listing.imageUrls?.[0] ?? null}
                  title={listing.title}
                  subtitle={
                    variantCount > 0
                      ? `${variantCount} Variant${variantCount !== 1 ? "s" : ""}`
                      : undefined
                  }
                  onClick={() => router.push(ROUTES.editListing(listing.id!))}
                />
              );
            })}
          </div>
        </>
      )}

      <BottomNav activeItem="create" />
    </div>
  );
}
