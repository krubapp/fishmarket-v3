"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useAuth } from "@/hooks/useAuth";
import { getCart, addCartItem as addCartItemFirestore } from "@/lib/firestore";
import type { CartItem } from "@/lib/schemas/cart";

type CartContextValue = {
  itemCount: number;
  refresh: () => Promise<void>;
  addItem: (item: CartItem) => Promise<void>;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [itemCount, setItemCount] = useState(0);

  const refresh = useCallback(async () => {
    if (!user?.uid) {
      setItemCount(0);
      return;
    }
    const cart = await getCart(user.uid);
    setItemCount(cart.items.reduce((n, i) => n + i.quantity, 0));
  }, [user?.uid]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addItem = useCallback(
    async (item: CartItem) => {
      if (!user?.uid) return;
      await addCartItemFirestore(user.uid, item);
      await refresh();
    },
    [user?.uid, refresh],
  );

  const value: CartContextValue = { itemCount, refresh, addItem };

  return (
    <CartContext.Provider value={value}>{children}</CartContext.Provider>
  );
}

export function useCartContext(): CartContextValue | null {
  return useContext(CartContext);
}
