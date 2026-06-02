"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import signOut from "@/lib/auth";

export default function SignoutPage() {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      await signOut();
      router.push("/auth/login");
    })();
  }, [router]);

  return (
    <main className="flex items-center justify-center">
      <div className="text-center">
        <p className="text-lg">Signing out…</p>
      </div>
    </main>
  );
}
