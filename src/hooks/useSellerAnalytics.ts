import { useQuery } from "@tanstack/react-query";
import type { SellerAnalytics } from "@/app/api/seller/analytics/route";

async function fetchSellerAnalytics(
  sellerId: string,
): Promise<SellerAnalytics> {
  const res = await fetch(
    `/api/seller/analytics?sellerId=${encodeURIComponent(sellerId)}`,
  );
  if (!res.ok) throw new Error("Failed to fetch seller analytics");
  return res.json();
}

export function useSellerAnalytics(sellerId: string | undefined) {
  return useQuery({
    queryKey: ["sellerAnalytics", sellerId],
    queryFn: () => fetchSellerAnalytics(sellerId!),
    enabled: !!sellerId,
  });
}
