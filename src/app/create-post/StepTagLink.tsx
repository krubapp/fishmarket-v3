"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useFormContext } from "react-hook-form";
import { Icon } from "@/components/Icon";
import { Avatar } from "@/components/Avatar";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { Tabs } from "@/components/Tabs";
import { Checkbox } from "@/components/Checkbox";
import { ImageBlock } from "@/components/ImageBlock";
import { searchUsers, searchListings } from "@/lib/firestore";
import type { UserProfile } from "@/lib/firestore";
import type { Listing } from "@/lib/schemas/listing";
import type { CreatePostFormData } from "@/lib/schemas/post";

type TabId = "people" | "products" | "creators";

const TAB_ITEMS = [
  { id: "people" as const, label: "People" },
  { id: "products" as const, label: "Products" },
  { id: "creators" as const, label: "Creators" },
];

type StepTagLinkProps = {
  onNext: () => void;
};

export function StepTagLink({ onNext }: StepTagLinkProps) {
  const { watch, setValue } = useFormContext<CreatePostFormData>();

  const rawTaggedUserIds = watch("taggedUserIds");
  const rawTaggedListingIds = watch("taggedListingIds");
  const taggedUserIds = useMemo(() => rawTaggedUserIds ?? [], [rawTaggedUserIds]);
  const taggedListingIds = useMemo(() => rawTaggedListingIds ?? [], [rawTaggedListingIds]);

  const [activeTab, setActiveTab] = useState<TabId>("people");
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingListings, setLoadingListings] = useState(true);

  useEffect(() => {
    let cancelled = false;
    searchUsers("").then((results) => {
      if (!cancelled) {
        setUsers(results);
        setLoadingUsers(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    searchListings({}).then((results) => {
      if (!cancelled) {
        setListings(results);
        setLoadingListings(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredUsers = useMemo(() => {
    if (!query.trim()) return users;
    const lower = query.toLowerCase();
    return users.filter(
      (u) =>
        u.displayName?.toLowerCase().includes(lower) ||
        u.username?.toLowerCase().includes(lower),
    );
  }, [users, query]);

  const filteredListings = useMemo(() => {
    if (!query.trim()) return listings;
    const lower = query.toLowerCase();
    return listings.filter((l) => l.title.toLowerCase().includes(lower));
  }, [listings, query]);

  const peopleList = useMemo(() => filteredUsers, [filteredUsers]);

  const creatorsList = useMemo(
    () => filteredUsers.filter((u) => u.isSeller),
    [filteredUsers],
  );

  const toggleUser = useCallback(
    (uid: string) => {
      const current = taggedUserIds;
      if (current.includes(uid)) {
        setValue(
          "taggedUserIds",
          current.filter((id) => id !== uid),
        );
      } else {
        setValue("taggedUserIds", [...current, uid]);
      }
    },
    [taggedUserIds, setValue],
  );

  const toggleListing = useCallback(
    (listingId: string) => {
      const current = taggedListingIds;
      if (current.includes(listingId)) {
        setValue(
          "taggedListingIds",
          current.filter((id) => id !== listingId),
        );
      } else {
        setValue("taggedListingIds", [...current, listingId]);
      }
    },
    [taggedListingIds, setValue],
  );

  const activeList = activeTab === "products" ? "listings" : "users";

  const displayUsers =
    activeTab === "creators" ? creatorsList : peopleList;

  const groupedListings = useMemo(() => {
    const groups: Record<string, Listing[]> = {};
    filteredListings.forEach((l) => {
      const cat = l.category || "Other";
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(l);
    });
    return groups;
  }, [filteredListings]);

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Tabs */}
      <Tabs
        tabs={TAB_ITEMS}
        value={activeTab}
        onValueChange={(id) => {
          setActiveTab(id as TabId);
          setQuery("");
        }}
      />

      {/* Search */}
      <div className="px-6 pt-4">
        <div className="flex items-center gap-2 rounded-lg bg-surface-default px-3 py-2.5">
          <Icon name="search" size={18} className="text-text-default-placeholder" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search..."
            className="flex-1 bg-transparent text-sm text-text-default-body placeholder:text-text-default-placeholder focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="transition-transform duration-(--duration-press) ease-(--ease-spring) active:scale-[0.85]"
              aria-label="Clear search"
            >
              <Icon name="close" size={16} className="text-text-default-placeholder" />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 pb-6 pt-2">
        {activeList === "users" ? (
          loadingUsers ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900" />
            </div>
          ) : displayUsers.length === 0 ? (
            <p className="py-12 text-center text-sm text-text-default-secondary">
              No users found
            </p>
          ) : (
            <div className="flex flex-col">
              {displayUsers.map((user) => {
                const isSelected = taggedUserIds.includes(user.uid);
                return (
                  <button
                    key={user.uid}
                    type="button"
                    onClick={() => toggleUser(user.uid)}
                    className="flex items-center gap-3 rounded-xl px-1 py-3 transition-[background-color,transform] duration-(--duration-press) ease-(--ease-spring) hover:bg-surface-default active:scale-[0.98]"
                  >
                    <Avatar
                      src={user.avatarUrl}
                      alt={user.displayName ?? user.username ?? ""}
                      size={48}
                    />
                    <div className="flex flex-1 flex-col items-start">
                      <span className="text-sm font-semibold text-text-default-headings">
                        {user.displayName || user.username || "User"}
                      </span>
                      <span className="text-xs text-text-default-secondary">
                        {user.username ? `@${user.username}` : user.email}
                      </span>
                    </div>
                    <Checkbox
                      checked={isSelected}
                      onChange={() => toggleUser(user.uid)}
                      aria-label={`Tag ${user.displayName || user.username || "user"}`}
                    />
                  </button>
                );
              })}
            </div>
          )
        ) : loadingListings ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900" />
          </div>
        ) : filteredListings.length === 0 ? (
          <p className="py-12 text-center text-sm text-text-default-secondary">
            No products found
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {Object.entries(groupedListings).map(([category, items]) => (
              <div key={category} className="flex flex-col gap-1">
                <p className="py-2 text-[11px] font-semibold uppercase tracking-wider text-text-default-secondary">
                  {category}
                </p>
                {items.map((listing) => {
                  const isSelected = taggedListingIds.includes(
                    listing.id ?? "",
                  );
                  return (
                    <button
                      key={listing.id}
                      type="button"
                      onClick={() => listing.id && toggleListing(listing.id)}
                      className="flex items-center gap-3 rounded-xl px-1 py-3 transition-[background-color,transform] duration-(--duration-press) ease-(--ease-spring) hover:bg-surface-default active:scale-[0.98]"
                    >
                      <ImageBlock
                        src={listing.imageUrls?.[0] ?? null}
                        alt={listing.title}
                        size="small"
                      />
                      <div className="flex flex-1 flex-col items-start gap-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-text-default-headings">
                            {listing.title}
                          </span>
                          <Badge variant="warning">{listing.category}</Badge>
                        </div>
                        <span className="text-xs text-text-default-secondary">
                          {listing.currency ?? "SEK"} {listing.price}
                        </span>
                      </div>
                      <Checkbox
                        checked={isSelected}
                        onChange={() =>
                          listing.id && toggleListing(listing.id)
                        }
                        aria-label={`Tag ${listing.title}`}
                      />
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="shrink-0 px-6 pb-6">
        <Button
          size="large"
          onClick={onNext}
          className="w-full"
        >
          Next: Settings
        </Button>
      </div>
    </div>
  );
}
