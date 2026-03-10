import { useQuery } from "@tanstack/react-query";
import { getUserListings } from "@/lib/firestore";
import type { TrackInventoryItem } from "@/components/TrackInventoryCard";

export function useSellerInventory(sellerId: string | undefined) {
  return useQuery({
    queryKey: ["sellerInventory", sellerId],
    queryFn: async () => {
      const listings = await getUserListings(sellerId!);
      const items: TrackInventoryItem[] = listings.map((listing) => {
        const totalAvailable = listing.variants?.reduce(
          (sum, group) =>
            sum +
            group.values.reduce((vSum, val) => vSum + (val.available ?? 0), 0),
          0,
        ) ?? 0;

        return {
          name: listing.title,
          detail: `${totalAvailable} available`,
          progress: totalAvailable > 0 ? Math.min(totalAvailable / 500, 1) : 0,
        };
      });
      return items;
    },
    enabled: !!sellerId,
  });
}
