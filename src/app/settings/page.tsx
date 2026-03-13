"use client";

import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { ContextTopBar } from "@/components/ContextTopBar";
import { Icon } from "@/components/Icon";
import { ROUTES } from "@/lib/routes";
import { auth } from "@/lib/firebase";
import type { MaterialSymbol } from "material-symbols";

const SETTINGS_ITEMS: {
  label: string;
  description: string;
  icon: MaterialSymbol;
  href: string;
}[] = [
  {
    label: "Account",
    description: "Profile photo, display name, username, bio",
    icon: "person",
    href: ROUTES.settingsAccount,
  },
  {
    label: "General",
    description: "Seller mode and app preferences",
    icon: "settings",
    href: ROUTES.settingsGeneral,
  },
];

export default function SettingsPage() {
  const router = useRouter();

  async function handleLogout() {
    try {
      await signOut(auth);
    } finally {
      router.replace(ROUTES.login);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <ContextTopBar
        backLabel="Profile"
        title="Settings"
        onBack={() => router.back()}
      />

      <div className="mx-auto flex w-full max-w-[440px] flex-col">
        <nav className="flex flex-col">
          {SETTINGS_ITEMS.map((item) => (
            <button
              key={item.href}
              className="flex items-center gap-4 border-b border-slate-200 px-6 py-4 text-left transition-colors duration-(--duration-press) ease-(--ease-spring) hover:bg-slate-50 active:scale-[0.99] active:bg-slate-100"
              onClick={() => router.push(item.href)}
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100">
                <Icon name={item.icon} size={20} className="text-slate-900" />
              </span>
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="font-semibold text-[16px] leading-normal text-slate-900">
                  {item.label}
                </span>
                <span className="font-normal text-[13px] leading-[1.4] text-grey-500">
                  {item.description}
                </span>
              </div>
              <Icon
                name="chevron_right"
                size={20}
                className="shrink-0 text-grey-500"
              />
            </button>
          ))}
        </nav>

        <button
          className="mt-4 flex items-center gap-4 border-b border-slate-200 px-6 py-4 text-left text-red-700 transition-colors duration-(--duration-press) ease-(--ease-spring) hover:bg-red-50 active:scale-[0.99] active:bg-red-100"
          onClick={handleLogout}
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50">
            <Icon name="logout" size={20} className="text-red-700" />
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="font-semibold text-[16px] leading-normal">
              Log out
            </span>
            <span className="font-normal text-[13px] leading-[1.4] text-grey-500">
              Sign out of your account
            </span>
          </div>
        </button>
      </div>
    </div>
  );
}
