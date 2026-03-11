"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/lib/routes";

/**
 * Redirects unauthenticated users to the login page for all routes except login.
 * Renders children only when the user is signed in or when on the login page.
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === ROUTES.login;

  useEffect(() => {
    if (loading) return;
    if (!user && !isLoginPage) {
      router.replace(ROUTES.login);
    }
  }, [user, loading, isLoginPage, router]);

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
      </div>
    );
  }

  if (!user && !isLoginPage) return null;

  return <>{children}</>;
}
