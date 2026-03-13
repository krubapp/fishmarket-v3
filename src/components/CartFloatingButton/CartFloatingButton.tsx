"use client";

import Link from "next/link";
import { Icon } from "@/components/Icon";
import { useCartContext } from "@/contexts/CartContext";
import { ROUTES } from "@/lib/routes";

const BOTTOM_OFFSET = "5rem";

export function CartFloatingButton() {
  const cart = useCartContext();
  const count = cart?.itemCount ?? 0;

  if (count <= 0) return null;

  return (
    <Link
      href={ROUTES.cart}
      className="fixed right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 text-white shadow-lg transition-transform duration-(--duration-press) ease-(--ease-spring) active:scale-[0.95] focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
      style={{ bottom: `calc(${BOTTOM_OFFSET} + env(safe-area-inset-bottom, 0px))` }}
      aria-label={`Cart with ${count} item${count === 1 ? "" : "s"}`}
    >
      <Icon name="shopping_cart" size={24} className="text-white" />
      <span
        className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 font-semibold text-white text-[10px] leading-none"
        aria-hidden
      >
        {count > 99 ? "99+" : count}
      </span>
    </Link>
  );
}
