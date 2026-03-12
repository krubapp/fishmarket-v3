"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { ContextTopBar } from "@/components/ContextTopBar";
import { SearchBar } from "@/components/SearchBar";
import { ProductListing } from "@/components/ProductListing";
import { BottomNav } from "@/components/BottomNav";
import { Tabs } from "@/components/Tabs";
import { ROUTES } from "@/lib/routes";
import {
  searchListings,
  getUserProfiles,
  getSellers,
  type UserProfile,
  type ListingFilters,
} from "@/lib/firestore";
import type { Listing } from "@/lib/schemas/listing";
import { FISH_TYPES } from "@/lib/schemas/listing";
import type { SearchBarResult } from "@/components/SearchBar";

const FISH_TYPE_TABS = [
  { id: "", label: "All" },
  ...FISH_TYPES.map((ft) => ({ id: ft, label: ft })),
];
import {
  SearchFilterDrawer,
  type SearchFilters,
} from "./SearchFilterDrawer";

function SearchPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const q = searchParams.get("q") ?? "";
  const fishType = searchParams.get("fishType") ?? "";
  const category = searchParams.get("category") ?? "";
  const condition = searchParams.get("condition") ?? "";
  const sellerId = searchParams.get("sellerId") ?? "";
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");

  const [listings, setListings] = useState<Listing[]>([]);
  const [sellerMap, setSellerMap] = useState<Map<string, UserProfile>>(
    new Map(),
  );
  const [sellers, setSellers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [searchInput, setSearchInput] = useState(q);
  const [suggestions, setSuggestions] = useState<SearchBarResult[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Fetch sellers for filter drawer
  useEffect(() => {
    getSellers(50).then(setSellers);
  }, []);

  // Fetch listings when params change
  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const filters: ListingFilters = {};
    if (fishType) filters.fishType = fishType;
    if (category) filters.category = category;
    if (condition) filters.condition = condition;
    if (sellerId) filters.sellerId = sellerId;
    if (q) filters.searchQuery = q;
    if (minPrice) filters.minPrice = Number(minPrice);
    if (maxPrice) filters.maxPrice = Number(maxPrice);

    searchListings(filters).then(async (results) => {
      if (cancelled) return;
      setListings(results);

      const uids = [...new Set(results.map((l) => l.sellerId).filter(Boolean) as string[])];
      if (uids.length > 0) {
        const profiles = await getUserProfiles(uids);
        if (!cancelled) setSellerMap(profiles);
      }
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [q, fishType, category, condition, sellerId, minPrice, maxPrice]);

  // Debounced suggestion search
  const handleSearchInput = useCallback(
    (value: string) => {
      setSearchInput(value);
      if (debounceRef.current) clearTimeout(debounceRef.current);

      if (!value.trim()) {
        setSuggestions([]);
        return;
      }

      debounceRef.current = setTimeout(async () => {
        const results = await searchListings({ searchQuery: value });
        const uids = [...new Set(results.map((l) => l.sellerId).filter(Boolean) as string[])];
        const profiles = uids.length > 0 ? await getUserProfiles(uids) : new Map<string, UserProfile>();

        setSuggestions(
          results.slice(0, 8).map((l) => ({
            id: l.id!,
            title: l.title,
            sellerName: profiles.get(l.sellerId!)?.displayName ?? "Unknown",
            sellerAvatarSrc: profiles.get(l.sellerId!)?.avatarUrl,
          })),
        );
      }, 300);
    },
    [],
  );

  const pushParams = useCallback(
    (updates: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, val]) => {
        if (val) params.set(key, val);
        else params.delete(key);
      });
      router.replace(`${ROUTES.shop}?${params.toString()}`);
    },
    [router, searchParams],
  );

  const handleSearchSubmit = useCallback(
    (value: string) => {
      setIsSearching(false);
      pushParams({ q: value || undefined });
    },
    [pushParams],
  );

  const handleResultSelect = useCallback(
    (result: SearchBarResult) => {
      setIsSearching(false);
      router.push(ROUTES.listingDetail(result.id));
    },
    [router],
  );

  const handleFilterApply = useCallback(
    (filters: SearchFilters) => {
      pushParams({
        condition: filters.condition,
        minPrice: filters.minPrice != null ? String(filters.minPrice) : undefined,
        maxPrice: filters.maxPrice != null ? String(filters.maxPrice) : undefined,
        sellerId: filters.sellerId,
      });
    },
    [pushParams],
  );

  const title = useMemo(() => {
    if (q) return `"${q}"`;
    if (fishType) return fishType;
    if (category) return category;
    return "All Listings";
  }, [q, fishType, category]);

  const currentFilters: SearchFilters = useMemo(
    () => ({
      condition: condition || undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      sellerId: sellerId || undefined,
    }),
    [condition, minPrice, maxPrice, sellerId],
  );

  // Search overlay
  if (isSearching) {
    return (
      <div className="flex min-h-dvh flex-col bg-white">
        <SearchBar
          value={searchInput}
          onValueChange={handleSearchInput}
          onSubmit={handleSearchSubmit}
          onCancel={() => setIsSearching(false)}
          results={suggestions}
          onResultSelect={handleResultSelect}
          placeholder="Search"
        />
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col bg-white">
      <ContextTopBar
        title={title}
        onFilter={() => setFilterOpen(true)}
        onSearch={() => {
          setSearchInput(q);
          setIsSearching(true);
        }}
      />

      {/* Fish type tabs */}
      <div className="overflow-x-auto bg-white p-1">
        <Tabs
          tabs={FISH_TYPE_TABS}
          value={fishType}
          onValueChange={(id) => pushParams({ fishType: id || undefined })}
        />
      </div>

      {/* Results grid */}
      <div className="mx-auto w-full max-w-[440px] flex-1 pb-[120px]">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <span className="text-grey-500 text-sm">Loading...</span>
          </div>
        ) : listings.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-20">
            <span className="font-semibold text-paragraph-lg text-text-default-headings">
              No results
            </span>
            <span className="text-sm text-grey-500">
              Try adjusting your search or filters
            </span>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-1 gap-y-2">
            {listings.map((listing) => {
              const seller = sellerMap.get(listing.sellerId ?? "");
              return (
                <ProductListing
                  key={listing.id}
                  imageSrc={listing.imageUrls?.[0] ?? ""}
                  title={listing.title}
                  price={`SEK ${listing.price.toLocaleString()}`}
                  conditionValue={
                    listing.condition
                      ? listing.condition.charAt(0).toUpperCase() +
                        listing.condition.slice(1)
                      : undefined
                  }
                  sellerName={seller?.displayName ?? "Unknown"}
                  sellerAvatarSrc={seller?.avatarUrl}
                  onClick={() =>
                    listing.id && router.push(ROUTES.listingDetail(listing.id))
                  }
                  className="w-full!"
                />
              );
            })}
          </div>
        )}
      </div>

      <BottomNav activeItem="shop" />

      <SearchFilterDrawer
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        filters={currentFilters}
        onApply={handleFilterApply}
        sellers={sellers}
      />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center bg-white">
          <span className="text-grey-500 text-sm">Loading...</span>
        </div>
      }
    >
      <SearchPageInner />
    </Suspense>
  );
}
