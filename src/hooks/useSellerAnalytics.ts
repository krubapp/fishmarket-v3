import { useQuery } from "@tanstack/react-query";
import { getAuthHeaders } from "@/lib/firebase";
import type { SellerAnalytics } from "@/app/api/seller/analytics/route";

async function fetchSellerAnalytics(
  sellerId: string,
): Promise<SellerAnalytics> {
  const headers = await getAuthHeaders();
  const res = await fetch(
    `/api/seller/analytics?sellerId=${encodeURIComponent(sellerId)}`,
    { headers },
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
