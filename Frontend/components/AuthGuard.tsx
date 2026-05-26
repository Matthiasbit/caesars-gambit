"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { buildAuthRedirectUrl, INVITE_LOGIN_MESSAGE } from "@/lib/invite";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const publicPaths = ["/auth"];
    const isPublic = pathname === "/" || publicPaths.some(p => pathname?.startsWith(p));
    if (isPublic) return;

    const redirectTo = typeof window !== "undefined"
      ? `${window.location.pathname}${window.location.search}`
      : pathname ?? "/";

    fetch(`${API_BASE}/api/user/currentUser`, {
      credentials: "include",
    }).then(res => {
      if (!res.ok) {
        router.replace(buildAuthRedirectUrl("/auth/login", redirectTo, INVITE_LOGIN_MESSAGE));
      }
    }).catch(() => {
      router.replace(buildAuthRedirectUrl("/auth/login", redirectTo, INVITE_LOGIN_MESSAGE));
    });
  }, [pathname, router]);

  return <>{children}</>;
}
