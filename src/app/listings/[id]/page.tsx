"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ContextTopBar } from "@/components/ContextTopBar";
import { Avatar } from "@/components/Avatar";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { VariantOptionButton } from "@/components/VariantOptionButton";
import { Accordion, AccordionItem } from "@/components/Accordion";
import { CostBreakdown } from "@/components/CostBreakdown";
import { getListing, getUserProfile } from "@/lib/firestore";
import type { UserProfile } from "@/lib/firestore";
import type { Listing, VariantGroup, VariantValue } from "@/lib/schemas/listing";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/lib/routes";

function findVariantValue(
  groups: VariantGroup[],
  valueId: string,
): VariantValue | undefined {
  for (const g of groups) {
    const v = g.values.find((val) => val.id === valueId);
    if (v) return v;
  }
  return undefined;
}

function buildVariantLabel(
  groups: VariantGroup[],
  selections: Record<string, string>,
): string {
  return groups
    .map((g) => {
      const val = g.values.find((v) => v.id === selections[g.id]);
      return val ? `${g.name}: ${val.name}` : null;
    })
    .filter(Boolean)
    .join(" / ");
}

export default function ListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const listingId = params.id as string;

  const [listing, setListing] = useState<Listing | null>(null);
  const [seller, setSeller] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [purchasing, setPurchasing] = useState(false);

  const [selectedVariants, setSelectedVariants] = useState<
    Record<string, string>
  >({});
  const [currentImageIdx, setCurrentImageIdx] = useState(0);

  useEffect(() => {
    async function load() {
      try {
        const l = await getListing(listingId);
        if (!l) {
          setError("Listing not found");
          return;
        }
        setListing(l);
        if (l.sellerId) {
          const s = await getUserProfile(l.sellerId);
          setSeller(s);
        }
      } catch {
        setError("Failed to load listing");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [listingId]);

  if (loading) {
    return (
      <div className="mx-auto flex min-h-dvh max-w-[440px] items-center justify-center border-x border-slate-200 bg-white">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="mx-auto flex min-h-dvh max-w-[440px] flex-col border-x border-slate-200 bg-white">
        <ContextTopBar
          backLabel="Back"
          title="Not Found"
          onBack={() => router.push(ROUTES.home)}
        />
        <div className="flex flex-1 items-center justify-center p-6">
          <p className="text-grey-500 text-center">
            {error || "Listing not found"}
          </p>
        </div>
      </div>
    );
  }

  const hasVariants =
    listing.variants && listing.variants.length > 0 &&
    listing.variants.some((g) => g.values.length > 0);

  const allGroupsSelected = hasVariants
    ? listing.variants!.every((g) => selectedVariants[g.id])
    : true;

  // Resolve active price from variant selection
  let activePrice = listing.price;
  let activeVariantValue: VariantValue | undefined;
  if (hasVariants && allGroupsSelected) {
    // Use the last group's selected value price (most specific)
    const lastGroup = listing.variants![listing.variants!.length - 1];
    const selectedId = selectedVariants[lastGroup.id];
    if (selectedId) {
      activeVariantValue = findVariantValue(listing.variants!, selectedId);
      if (activeVariantValue && activeVariantValue.price > 0) {
        activePrice = activeVariantValue.price;
      }
    }
  }

  const outOfStock = activeVariantValue
    ? activeVariantValue.available === 0
    : false;

  const buyDisabled =
    !user || (hasVariants && !allGroupsSelected) || outOfStock || purchasing;

  // Image: use variant image if selected and available
  const variantImage =
    hasVariants && Object.values(selectedVariants).length > 0
      ? (() => {
          for (const valId of Object.values(selectedVariants)) {
            const v = findVariantValue(listing.variants!, valId);
            if (v?.imageUrl) return v.imageUrl;
          }
          return null;
        })()
      : null;

  const displayImages = listing.imageUrls || [];
  const mainImage = variantImage || displayImages[currentImageIdx] || null;

  async function handleBuyNow() {
    if (!user || !listing) return;
    setPurchasing(true);
    try {
      const body: Record<string, unknown> = {
        listingId: listing.id,
        buyerId: user.uid,
      };
      if (hasVariants && allGroupsSelected) {
        const lastGroup = listing.variants![listing.variants!.length - 1];
        body.variantValueId = selectedVariants[lastGroup.id];
      }
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Failed to start checkout");
      }
    } catch {
      alert("Failed to start checkout");
    } finally {
      setPurchasing(false);
    }
  }

  const shippingCost = listing.shippingCost ?? 0;
  const totalAmount = activePrice + shippingCost;

  return (
    <div className="mx-auto flex min-h-dvh max-w-[440px] flex-col border-x border-slate-200 bg-white">
      <ContextTopBar
        backLabel="Back"
        title={listing.title}
        onBack={() => router.back()}
      />

      {/* Product image */}
      <div className="relative aspect-square w-full bg-grey-200">
        {mainImage ? (
          <img
            src={mainImage}
            alt={listing.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-grey-500">
            No image
          </div>
        )}
        {/* Image nav dots */}
        {displayImages.length > 1 && !variantImage && (
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
            {displayImages.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentImageIdx(i)}
                className={`h-2 w-2 rounded-full transition-colors ${
                  i === currentImageIdx ? "bg-slate-900" : "bg-white/70"
                }`}
                aria-label={`Image ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col gap-6 p-6">
        {/* Title + badge row */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            {listing.condition && (
              <Badge variant="default">
                {listing.condition.charAt(0).toUpperCase() +
                  listing.condition.slice(1)}
              </Badge>
            )}
            {listing.category && (
              <Badge variant="default">{listing.category}</Badge>
            )}
          </div>
          <h1 className="text-(length:--font-size-body-lg) font-semibold leading-[1.4] text-slate-900">
            {listing.title}
          </h1>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-2">
          <span className="text-(length:--font-size-body-xl) font-semibold text-slate-900">
            {listing.currency || "SEK"} {activePrice.toLocaleString()}
          </span>
        </div>

        {/* Seller */}
        {seller && (
          <div className="flex items-center gap-3">
            <Avatar
              src={seller.avatarUrl}
              alt={seller.displayName}
              size={32}
            />
            <span className="text-paragraph-sm font-medium text-grey-800">
              {seller.displayName || seller.username || "Seller"}
            </span>
          </div>
        )}

        {/* Variants */}
        {hasVariants &&
          listing.variants!.map((group) => (
            <div key={group.id} className="flex flex-col gap-3">
              <span className="text-paragraph-sm font-semibold text-slate-900">
                {group.name}
              </span>
              <div className="flex flex-wrap gap-2">
                {group.values.map((val) => {
                  const isSelected = selectedVariants[group.id] === val.id;
                  const isOos = val.available === 0;
                  return (
                    <div key={val.id} className="flex flex-col items-center gap-1">
                      <VariantOptionButton
                        selected={isSelected}
                        disabled={isOos}
                        onClick={() =>
                          setSelectedVariants((prev) => ({
                            ...prev,
                            [group.id]: val.id,
                          }))
                        }
                        className="min-w-[100px]"
                      >
                        {val.name}
                      </VariantOptionButton>
                      <span
                        className={`text-[12px] font-medium ${
                          isOos ? "text-red-600" : "text-grey-500"
                        }`}
                      >
                        {isOos ? "Out of stock" : `${val.available} left`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

        {/* Description */}
        {listing.description && (
          <AccordionItem title="Description" defaultOpen>
            <p className="text-(length:--font-size-body-md) leading-normal text-grey-800">
              {listing.description}
            </p>
          </AccordionItem>
        )}

        {/* Specifications */}
        {listing.specifications && (
          <AccordionItem title="Specifications">
            <p className="text-(length:--font-size-body-md) leading-normal text-grey-800 whitespace-pre-wrap">
              {listing.specifications}
            </p>
          </AccordionItem>
        )}

        {/* Cost breakdown */}
        <CostBreakdown
          rows={[
            {
              label: "Item price",
              value: `${listing.currency || "SEK"} ${activePrice.toLocaleString()}`,
            },
            {
              label: "Shipping",
              value:
                shippingCost > 0
                  ? `${listing.currency || "SEK"} ${shippingCost.toLocaleString()}`
                  : "Free",
            },
            {
              label: "Total",
              value: `${listing.currency || "SEK"} ${totalAmount.toLocaleString()}`,
              highlightLabel: true,
            },
          ]}
        />

        {/* Buy Now */}
        <Button
          size="large"
          onClick={handleBuyNow}
          disabled={buyDisabled}
          loading={purchasing}
          className="w-full"
        >
          {!user
            ? "Sign in to buy"
            : hasVariants && !allGroupsSelected
              ? "Select options"
              : outOfStock
                ? "Out of stock"
                : "Buy Now"}
        </Button>
      </div>
    </div>
  );
}
