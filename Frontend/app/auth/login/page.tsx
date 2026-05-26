"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Item } from "@/components/ui/item";
import { SquareArrowOutUpRight } from "lucide-react";
import { AUTH_LOGIN_REASONS, getAuthLoginMessage } from "@/lib/authMessages";
import { normalizeInternalRedirect } from "@/lib/invite";

import packageJson from "@/package.json";

const APP_VERSION = packageJson.version;

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null); 
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = normalizeInternalRedirect(searchParams.get("redirectTo"));

  useEffect(() => {
    const reason = searchParams.get("reason");
    if (reason === AUTH_LOGIN_REASONS.inviteJoin || reason === AUTH_LOGIN_REASONS.generic) {
      setMessage(getAuthLoginMessage(reason)); 
      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.delete("reason");
      router.replace(`${currentUrl.pathname}${currentUrl.search}`);
    }
  }, [searchParams, router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/auth/login`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      router.push(redirectTo);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : String(e));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-80 pointer-events-none">
        <Image
          src="/assets/Karte-neutral.svg"
          alt="map bg"
          fill
          sizes="100vw"
          priority
          className="object-cover"
        />
      </div>

      <nav className="relative z-10 border-b border-slate-700/30 bg-slate-900/50 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-6 py-4">
          <Link href="/" className="inline-flex items-center gap-3">
            <Image src="/assets/logo.svg" alt="logo" width={32} height={32} loading="eager" className="w-8 h-8 object-contain" />
            <span className="sr-only">Startseite</span>
          </Link>
          <h1 className="text-xl font-semibold">Caesar&apos;s Gambit</h1>
        </div>
      </nav>

      <main className="relative z-10 mx-auto grid min-h-[70vh] max-w-6xl items-center gap-12 px-6 py-16 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/10 px-4 py-2 text-sm text-blue-100 backdrop-blur-sm">
            Login
          </div>
          <div className="space-y-4">
            <h2 className="text-5xl font-bold leading-tight md:text-6xl">
              Willkommen zurück
            </h2>
            <p className="max-w-xl text-xl text-slate-300">
              Melde dich an und ziehe in die Schlacht!
            </p>
          </div>
        </section>

        <section className="rounded-3xl border border-blue-500/10 bg-slate-900/25 p-6 shadow-2xl backdrop-blur-md sm:p-8">
          <Item className="w-full border-0 bg-transparent p-0 shadow-none">
            {message && (
              <div className="mb-4 rounded-md bg-yellow-100 p-4 text-yellow-800">
                {message}
              </div>
            )}
            <form onSubmit={submit} className="flex w-full flex-col gap-4">
              <div>
                <h3 className="text-2xl font-semibold">Login</h3>
                <p className="mt-1 text-sm text-slate-300">Melde dich mit deinem Konto an.</p>
              </div>
              {err && <div className="text-sm text-red-400">{err}</div>}
              <Input
                label="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                type="email"
                required
              />
              <Input
                label="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                type="password"
                required
              />
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button type="submit" className="cursor-pointer sm:flex-1">Login</Button>
                <Button
                  type="button"
                  className="cursor-pointer sm:flex-1"
                  variant="ghost"
                  onClick={() => router.push(`/auth/register?redirectTo=${encodeURIComponent(redirectTo)}`)}
                >
                  <SquareArrowOutUpRight size={13} className="mr-2" /> Register
                </Button>
              </div>
            </form>
          </Item>
        </section>
      </main>

      <footer className="relative z-10 mt-8 border-t border-slate-700/30 py-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 text-center text-sm text-slate-400 md:flex-row md:items-center md:justify-between md:text-left">
          <p>© 2026 Caesar&apos;s Gambit</p>
          <p className="text-xs text-slate-500">Version {APP_VERSION}</p>
        </div>
      </footer>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
