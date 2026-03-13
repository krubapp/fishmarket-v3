"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ContextTopBar } from "@/components/ContextTopBar";
import { Avatar } from "@/components/Avatar";
import { Button } from "@/components/Button";
import { VariantOptionButton } from "@/components/VariantOptionButton";
import { AccordionItem } from "@/components/Accordion";
import { Badge } from "@/components/Badge";
import { Drawer } from "@/components/Drawer";
import { ImageButton } from "@/components/ImageButton";
import { Icon } from "@/components/Icon";
import { Rating } from "@/components/Rating";
import { Textarea } from "@/components/Textarea";
import { BottomNav } from "@/components/BottomNav";
import { Snackbar } from "@/components/Snackbar";
import {
  getListing,
  getListingReviewByUser,
  getListingReviews,
  getUserProfile,
  getUserProfiles,
  getPostsByTaggedListingId,
  isListingFavorited,
  setListingReview,
  toggleListingFavorite,
} from "@/lib/firestore";
import type { UserProfile } from "@/lib/firestore";
import type { Listing, VariantGroup, VariantValue } from "@/lib/schemas/listing";
import type { ListingReview } from "@/lib/schemas/listing-review";
import type { Post } from "@/lib/schemas/post";
import { VideoThumbnailCard } from "@/components/VideoThumbnailCard";
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
  const { user, profile: authProfile } = useAuth();
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
  const [favorited, setFavorited] = useState(false);
  const [togglingFavorite, setTogglingFavorite] = useState(false);
  const [shareSnackbarOpen, setShareSnackbarOpen] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [taggedPosts, setTaggedPosts] = useState<Post[]>([]);
  const [taggedPostsLoading, setTaggedPostsLoading] = useState(false);
  const [taggedPostCreators, setTaggedPostCreators] = useState<
    Map<string, UserProfile>
  >(new Map());
  const [reviews, setReviews] = useState<ListingReview[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewerProfiles, setReviewerProfiles] = useState<
    Map<string, UserProfile>
  >(new Map());
  const [myReview, setMyReview] = useState<ListingReview | null>(null);
  const [addReviewOpen, setAddReviewOpen] = useState(false);
  const [reviewFormRating, setReviewFormRating] = useState(0);
  const [reviewFormText, setReviewFormText] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSnackbarOpen, setReviewSnackbarOpen] = useState(false);
  const [reviewErrorSnackbarOpen, setReviewErrorSnackbarOpen] = useState(false);

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

  useEffect(() => {
    if (!user?.uid || !listingId) return;
    isListingFavorited(listingId, user.uid).then(setFavorited).catch(() => {});
  }, [listingId, user?.uid]);

  useEffect(() => {
    if (!listingId) return;
    let cancelled = false;
    setTaggedPostsLoading(true);
    getPostsByTaggedListingId(listingId)
      .then((posts) => {
        if (!cancelled) setTaggedPosts(posts);
        const userIds = [...new Set(posts.map((p) => p.userId).filter(Boolean))];
        if (userIds.length === 0) return;
        return getUserProfiles(userIds);
      })
      .then((profilesMap) => {
        if (!cancelled && profilesMap) setTaggedPostCreators(profilesMap);
      })
      .finally(() => {
        if (!cancelled) setTaggedPostsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [listingId]);

  useEffect(() => {
    if (!listingId) return;
    let cancelled = false;
    setReviewsLoading(true);
    getListingReviews(listingId)
      .then((list) => {
        if (!cancelled) setReviews(list);
        const userIds = [...new Set(list.map((r) => r.userId).filter(Boolean))];
        if (userIds.length === 0) return;
        return getUserProfiles(userIds);
      })
      .then((profilesMap) => {
        if (!cancelled && profilesMap) setReviewerProfiles(profilesMap);
      })
      .finally(() => {
        if (!cancelled) setReviewsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [listingId]);

  useEffect(() => {
    if (!listingId || !user?.uid) return;
    getListingReviewByUser(listingId, user.uid).then(setMyReview).catch(() => {});
  }, [listingId, user?.uid]);

  async function handleToggleFavorite() {
    if (!user?.uid || togglingFavorite) return;
    setTogglingFavorite(true);
    setFavorited((prev) => !prev);
    try {
      const nowFavorited = await toggleListingFavorite(listingId, user.uid);
      setFavorited(nowFavorited);
    } catch {
      setFavorited((prev) => !prev);
    } finally {
      setTogglingFavorite(false);
    }
  }

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

  function formatReviewDate(createdAt: ListingReview["createdAt"]): string {
    if (!createdAt?.seconds) return "—";
    const d = new Date(createdAt.seconds * 1000);
    return d.toLocaleDateString(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  async function handleSubmitReview() {
    if (!user?.uid || !listingId || reviewFormRating < 1 || reviewSubmitting)
      return;
    const rating = reviewFormRating;
    const text = reviewFormText.trim();
    setReviewSubmitting(true);

    // Close drawer and reset form immediately
    setAddReviewOpen(false);
    setReviewFormRating(0);
    setReviewFormText("");

    const optimisticId = `opt-${Date.now()}`;
    const optimisticReview: ListingReview = {
      id: optimisticId,
      listingId,
      userId: user.uid,
      rating,
      text,
      createdAt: {
        seconds: Math.floor(Date.now() / 1000),
        nanoseconds: 0,
      },
    };

    // Show the new review right away
    setReviews((prev) => [optimisticReview, ...prev]);
    setMyReview(optimisticReview);
    setReviewerProfiles((prev) => {
      const next = new Map(prev);
      if (authProfile) next.set(user.uid, authProfile);
      return next;
    });
    setReviewSubmitting(false);

    try {
      await setListingReview({ listingId, userId: user.uid, rating, text });
      const [updatedReviews, updatedMy] = await Promise.all([
        getListingReviews(listingId),
        getListingReviewByUser(listingId, user.uid),
      ]);
      setReviews(updatedReviews);
      setMyReview(updatedMy);
      const userIds = [
        ...new Set(updatedReviews.map((r) => r.userId).filter(Boolean)),
      ];
      if (userIds.length > 0) {
        const profiles = await getUserProfiles(userIds);
        setReviewerProfiles(profiles);
      }
      setReviewSnackbarOpen(true);
    } catch {
      setReviews((prev) => prev.filter((r) => r.id !== optimisticId));
      setMyReview(null);
      setReviewErrorSnackbarOpen(true);
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
          {user && (
            <button
              type="button"
              onClick={handleToggleFavorite}
              disabled={togglingFavorite}
              aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
              className="absolute right-[24px] top-[24px] flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md transition-transform duration-(--duration-press) ease-(--ease-spring) active:scale-[0.9] disabled:pointer-events-none"
            >
              <Icon
                name="favorite"
                size={20}
                fill={favorited ? 1 : 0}
                className={favorited ? "text-red-500" : "text-slate-900"}
              />
            </button>
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

        {/* Tag videos – only show when this listing has tagged posts */}
        {taggedPosts.length > 0 && (
          <section className="flex flex-col gap-6">
            <div>
              <h2 className="font-bold leading-[1.33] text-[length:var(--font-size-paragraph-xl)] text-slate-900">
                Videos featuring this product
              </h2>
              <p className="mt-1 font-normal leading-[1.5] text-[length:var(--font-size-body-md)] text-grey-800">
                Community posts that tagged this listing
              </p>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {taggedPosts.map((post) => {
                const creator = post.userId
                  ? taggedPostCreators.get(post.userId)
                  : null;
                return (
                  <div
                    key={post.id}
                    className="w-[140px] shrink-0"
                  >
                    <VideoThumbnailCard
                      thumbnailUrl={post.thumbnailUrl ?? null}
                      viewCount={post.viewCount ?? 0}
                      creatorAvatarUrl={creator?.avatarUrl ?? null}
                      creatorName={creator?.displayName ?? creator?.username}
                      onClick={() =>
                        post.id && router.push(ROUTES.postDetail(post.id))
                      }
                    />
                  </div>
                );
              })}
            </div>
          </section>
        )}

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
            title="Reviews"
            headerRight={
              <div className="flex items-center gap-2">
                <Rating
                  value={
                    reviews.length > 0
                      ? Math.round(
                          reviews.reduce((s, r) => s + r.rating, 0) /
                            reviews.length,
                        )
                      : 0
                  }
                  size={24}
                  className="shrink-0"
                />
                <Badge variant="default">
                  {reviewsLoading ? "…" : `${reviews.length} reviews`}
                </Badge>
              </div>
            }
            defaultOpen
          >
            <div className="flex flex-col gap-6">
              {user && !myReview && (
                <Button
                  size="small"
                  variant="subtle"
                  className="w-fit"
                  onClick={() => setAddReviewOpen(true)}
                >
                  Add a Review
                </Button>
              )}
              {reviewsLoading ? (
                <div className="py-4 text-[length:var(--font-size-paragraph-sm)] text-grey-500">
                  Loading reviews…
                </div>
              ) : reviews.length === 0 ? (
                <p className="font-normal text-[length:var(--font-size-paragraph-sm)] leading-[1.43] text-grey-600">
                  No reviews yet.
                  {user && !myReview
                    ? " Be the first to share your experience."
                    : ""}
                </p>
              ) : (
                <div className="flex flex-col divide-y divide-slate-200">
                  {reviews.map((review) => {
                    const reviewer = reviewerProfiles.get(review.userId);
                    return (
                      <div
                        key={review.id ?? `${review.listingId}_${review.userId}`}
                        className="flex flex-col gap-4 py-4"
                      >
                        <div className="flex gap-2">
                          <Link
                            href={ROUTES.profileByUsername(
                              reviewer?.username ?? review.userId,
                            )}
                            className="shrink-0 block transition-opacity hover:opacity-90"
                          >
                            <Avatar
                              size={80}
                              src={reviewer?.avatarUrl ?? null}
                              alt={reviewer?.displayName ?? "Reviewer"}
                            />
                          </Link>
                          <div className="min-w-0 flex-1 flex flex-col gap-1">
                            <Link
                              href={ROUTES.profileByUsername(
                                reviewer?.username ?? review.userId,
                              )}
                              className="inline-block font-semibold text-[length:var(--font-size-body-md)] text-slate-900 hover:text-slate-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 rounded"
                            >
                              {reviewer?.displayName ?? reviewer?.username ?? "Customer"}
                            </Link>
                            <Rating
                              value={review.rating}
                              size={24}
                              className="shrink-0"
                            />
                            {review.text ? (
                              <p className="mt-2 font-normal text-[length:var(--font-size-paragraph-sm)] leading-[1.43] text-grey-600">
                                {review.text}
                              </p>
                            ) : null}
                            <span className="mt-1 block font-normal text-[length:var(--font-size-caption)] text-grey-700">
                              {formatReviewDate(review.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </AccordionItem>
        </div>
      </div>

      <Drawer
        open={addReviewOpen}
        onClose={() => {
          setAddReviewOpen(false);
          setReviewFormRating(0);
          setReviewFormText("");
        }}
        title="Add a Review"
        width={440}
      >
        <div className="flex flex-col gap-6">
          <div>
            <p className="mb-2 font-medium text-[length:var(--font-size-paragraph-sm)] text-slate-900">
              Your rating
            </p>
            <Rating
              value={reviewFormRating}
              onChange={setReviewFormRating}
              size={28}
            />
          </div>
          <Textarea
            label="Your review (optional)"
            placeholder="Share your experience with this product…"
            value={reviewFormText}
            onChange={(e) => setReviewFormText(e.target.value)}
            rows={4}
          />
          <Button
            size="medium"
            onClick={handleSubmitReview}
            disabled={reviewFormRating < 1 || reviewSubmitting}
            loading={reviewSubmitting}
            className="w-full"
          >
            Submit review
          </Button>
        </div>
      </Drawer>

      <Snackbar
        open={shareSnackbarOpen}
        onClose={() => setShareSnackbarOpen(false)}
        message="Link copied"
        icon="link"
        duration={3000}
      />
      <Snackbar
        open={reviewSnackbarOpen}
        onClose={() => setReviewSnackbarOpen(false)}
        message="Review submitted"
        icon="check_circle"
        duration={3000}
      />
      <Snackbar
        open={reviewErrorSnackbarOpen}
        onClose={() => setReviewErrorSnackbarOpen(false)}
        message="Couldn’t submit review. Try again."
        icon="error"
        duration={5000}
      />
      <Snackbar
        open={!!checkoutError}
        onClose={() => setCheckoutError(null)}
        message={checkoutError || ""}
        icon="error"
        duration={5000}
      />
      <BottomNav activeItem="shop" />
    </div>
  );
}
