import { useQuery } from "@tanstack/react-query";
import { getSellerOrders } from "@/lib/firestore";

export function useSellerOrders(sellerId: string | undefined) {
  return useQuery({
    queryKey: ["sellerOrders", sellerId],
    queryFn: () => getSellerOrders(sellerId!),
    enabled: !!sellerId,
  });
}
