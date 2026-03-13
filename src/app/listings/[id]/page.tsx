"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ContextTopBar } from "@/components/ContextTopBar";
import { Avatar } from "@/components/Avatar";
import { Button } from "@/components/Button";
import { VariantOptionButton } from "@/components/VariantOptionButton";
import { AccordionItem } from "@/components/Accordion";
import { ImageButton } from "@/components/ImageButton";
import { Icon } from "@/components/Icon";
import { Rating } from "@/components/Rating";
import { IconButton } from "@/components/IconButton";
import { Snackbar } from "@/components/Snackbar";
import { getListing, getUserProfile } from "@/lib/firestore";
import type { UserProfile } from "@/lib/firestore";
import type { Listing, VariantGroup, VariantValue } from "@/lib/schemas/listing";
import { useAuth } from "@/hooks/useAuth";
import { getAuthHeaders } from "@/lib/firebase";
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
  const [shareSnackbarOpen, setShareSnackbarOpen] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

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
      <div className="mx-auto flex min-h-dvh max-w-[440px] flex-col border-x border-slate-200 bg-white">
        <ContextTopBar backLabel="Shop" title="" onBack={() => router.back()} />
        <div className="flex flex-1 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
        </div>
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
      const authHeaders = await getAuthHeaders();
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setCheckoutError(data.error || "Failed to start checkout");
      }
    } catch {
      setCheckoutError("Failed to start checkout");
    } finally {
      setPurchasing(false);
    }
  }

  async function handleShare() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (!url || !listing) return;
    if (navigator.share) {
      try {
        await navigator.share({
          url,
          title: listing.title,
          text: listing.title,
        });
      } catch {
        // User cancelled or share failed; no need to surface
      }
      return;
    }
    // Fallback when Web Share API isn't available: copy link
    try {
      await navigator.clipboard?.writeText(url);
      setShareSnackbarOpen(true);
    } catch {
      // Clipboard failed (e.g. insecure context)
    }
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-[440px] flex-col border-x border-slate-200 bg-white">
      <ContextTopBar
        backLabel={listing.category || "Back"}
        title={listing.title}
        onBack={() => router.back()}
        onShare={handleShare}
      />

      {/* Product image + thumbnail strip (Figma 611:2552–2554) */}
      <div className="flex flex-col gap-1 bg-white">
        <div className="relative aspect-square w-full shrink-0 bg-grey-200">
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
        </div>
        {displayImages.length > 0 && (
          <div className="flex gap-1 overflow-x-auto px-6 pb-2">
            {displayImages.map((url, i) => (
              <ImageButton
                key={i}
                src={url}
                alt={`${listing.title} ${i + 1}`}
                selected={!variantImage && i === currentImageIdx}
                onClick={() => setCurrentImageIdx(i)}
                aria-label={`Image ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Content (Figma 611:2560–2581, 611:2561) */}
      <div className="flex flex-col gap-6 px-6 pb-24">
        {/* NEW DROP + Condition + Title + Price + Seller (Figma 611:2561) */}
        <div className="flex flex-col gap-[9px]">
          <div className="flex flex-col gap-[var(--spacing-layout-xxxs)]">
            {listing.condition === "new" && (
              <span className="font-bold leading-[var(--line-height-caption)] text-[length:var(--font-size-caption)] text-slate-900">
                NEW DROP
              </span>
            )}
            <div className="flex items-center gap-[var(--spacing-layout-xxxs)] text-[length:var(--font-size-paragraph-sm)] leading-[var(--line-height-paragraph-sm)]">
              <span className="font-medium text-grey-500">Condition:</span>
              <span className="font-semibold text-grey-800">
                {listing.condition
                  ? listing.condition.charAt(0).toUpperCase() +
                    listing.condition.slice(1)
                  : "—"}
              </span>
            </div>
          </div>
          <h1 className="font-medium leading-[var(--line-height-paragraph-xl)] text-[length:var(--font-size-paragraph-xl)] text-lime-600">
            {listing.title}
          </h1>
          <div className="flex items-baseline gap-[var(--spacing-layout-sm)]">
            <span className="font-semibold leading-[var(--line-height-paragraph-md)] text-[length:var(--font-size-paragraph-md)] text-lime-700">
              {listing.currency || "SEK"} {activePrice.toLocaleString()}
            </span>
          </div>
          {seller && (
            <div className="flex items-center gap-[var(--spacing-layout-xsm)]">
              <Avatar
                src={seller.avatarUrl}
                alt={seller.displayName}
                size={16}
              />
              <span className="font-medium leading-[var(--line-height-paragraph-sm)] text-[length:var(--font-size-paragraph-sm)] text-slate-900">
                {seller.displayName || seller.username || "Seller"}
              </span>
            </div>
          )}
        </div>

        {/* Variants */}
        {hasVariants &&
          listing.variants!.map((group) => (
            <div key={group.id} className="flex flex-col gap-3">
              <div className="flex flex-wrap gap-3">
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

        {/* Buy Now + Add to Cart (Figma 611:2579–2580) */}
        <div className="flex flex-col gap-3">
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
          <button
            type="button"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border-0 bg-transparent py-3 outline-none transition-transform duration-(--duration-press) ease-(--ease-spring) active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
            onClick={() => {}}
            disabled={!user}
          >
            <span className="font-medium leading-[1.5] text-[length:var(--font-size-body-md)] text-slate-900">
              Add to Cart
            </span>
            <Icon name="local_mall" size={20} className="shrink-0 text-slate-900" />
          </button>
        </div>

        {/* Tag videos (Figma 611:2226–2229) */}
        <section className="flex flex-col gap-6">
          <div>
            <h2 className="font-medium leading-[1.33] text-[length:var(--font-size-body-xl)] text-slate-900">
              Tag videos
            </h2>
            <p className="mt-1 font-normal leading-[1.5] text-[length:var(--font-size-body-md)] text-grey-800">
              Here&apos;s what people tagging for this lure
            </p>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {/* Placeholder: no tagged videos data yet */}
            <div className="flex h-[180px] w-[222px] shrink-0 items-center justify-center rounded-sm bg-grey-200 text-grey-500 text-[length:var(--font-size-paragraph-sm)]">
              No videos yet
            </div>
          </div>
        </section>

        {/* Accordions: full-bleed, border top/bottom only (Figma 611:2583) */}
        <div className="-mx-6">
          <AccordionItem title="Description" defaultOpen>
            <p className="font-normal leading-[var(--line-height-paragraph-sm)] text-[length:var(--font-size-paragraph-sm)] text-grey-800">
              {listing.description || "No description provided."}
            </p>
          </AccordionItem>

          <AccordionItem title="Specifications" defaultOpen>
            {listing.specifications?.trim() ? (
              <p className="font-normal leading-[var(--line-height-paragraph-sm)] text-[length:var(--font-size-paragraph-sm)] text-grey-800 whitespace-pre-wrap">
                {listing.specifications}
              </p>
            ) : (
              <p className="font-normal leading-[var(--line-height-paragraph-sm)] text-[length:var(--font-size-paragraph-sm)] text-grey-500">
                No specifications added yet.
              </p>
            )}
          </AccordionItem>

          <AccordionItem
            title="Ratings"
            headerRight={<Rating value={0} size={24} className="shrink-0" />}
            defaultOpen
          >
            <div className="flex flex-col gap-6">
              <Button size="small" variant="subtle" className="w-fit">
                Add a Review
              </Button>
              <div className="flex flex-col divide-y divide-slate-200">
                <div className="flex flex-col gap-4 py-4">
                  <div className="flex gap-2">
                    <Avatar size={80} className="shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium text-[length:var(--font-size-body-md)] text-grey-800">
                          Customer review
                        </span>
                        <IconButton
                          name="more_vert"
                          size="large"
                          variant="transparent"
                          aria-label="More options"
                        />
                      </div>
                      <Rating value={0} size={24} className="mt-1" />
                      <p className="mt-2 font-normal text-[length:var(--font-size-paragraph-sm)] leading-[1.43] text-grey-600">
                        No reviews yet. Be the first to share your experience.
                      </p>
                      <span className="mt-1 block font-normal text-[length:var(--font-size-caption)] text-grey-700">
                        —
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </AccordionItem>
        </div>
      </div>

      <Snackbar
        open={shareSnackbarOpen}
        onClose={() => setShareSnackbarOpen(false)}
        message="Link copied"
        icon="link"
        duration={3000}
      />
      <Snackbar
        open={!!checkoutError}
        onClose={() => setCheckoutError(null)}
        message={checkoutError || ""}
        icon="error"
        duration={5000}
      />
    </div>
  );
}
