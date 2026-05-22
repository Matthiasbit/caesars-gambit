'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Button from "@/components/ui/button";
import { createRoom } from "@/components/api/createRoom";
import { joinRoom } from "@/components/api/joinRoom";
import signOut from "@/lib/auth";
import { Github } from "lucide-react";
import { useGetCurrentUser } from "@/components/api/getCurrentUser";
import { Spinner } from "@/components/ui/spinner";

import packageJson from "@/package.json";

const APP_VERSION = packageJson.version;
// Dummy change for CI smoke testing.

export default function Home() {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);
  const [showJoinInput, setShowJoinInput] = useState(false);
  const [roomId, setRoomId] = useState("");
  const currentUser = useGetCurrentUser();
  const PAYPAL_LINK = "https://paypal.me/knoepsim/100";

  function parseRoomId(value: string): number | null {
    const trimmed = value.trim();
    if (!trimmed) return null;

    if (/^\d+$/.test(trimmed)) {
      return Number(trimmed);
    }

    const match = trimmed.match(/\/room\/(\d+)/i);
    if (match?.[1]) {
      return Number(match[1]);
    }

    return null;
  }

  const loading = currentUser.status === "loading";
  const isAuthenticated = currentUser.status === "authenticated";

  const handleLogout = async () => {
    try {
      await signOut();
      window.location.assign("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="flex items-center">
          <Spinner className="size-5 text-blue-300" />
        </div>
      </div>
    );
  }

  if (currentUser.status === "error") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-6 text-white">
        <div className="max-w-md rounded-3xl border border-white/10 bg-white/5 p-6 text-center shadow-2xl backdrop-blur-md">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-200/80">Fehler</p>
          <h1 className="mt-4 text-3xl font-bold">Anwendung ist zur Zeit nicht verfügbar</h1>
          <p className="mt-3 text-sm text-slate-300">Bitte versuche es in ein paar Minuten erneut.</p>
          <Button className="mt-6" variant="primary" size="lg" onClick={() => window.location.reload()}>
            Erneut versuchen
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-80 pointer-events-none">
        <Image
          src="/assets/Karte-neutral.svg"
          alt="Map background"
          fill
          sizes="100vw"
          priority
          className="object-cover"
        />
      </div>
      <div className="absolute right-10 top-10 z-0 h-64 w-64 opacity-10 pointer-events-none">
        <Image
          src="/assets/logo.svg"
          alt="Logo background"
          fill
          sizes="256px"
          loading="eager"
          className="object-contain"
        />
      </div>

      <nav className="relative z-10 border-b border-slate-700/30 bg-slate-900/50 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Image src="/assets/logo.svg" alt="Caesar's Gambit logo" width={32} height={32} loading="eager" className="w-8 h-8 object-contain" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-300 bg-clip-text text-transparent">
              Caesar&apos;s Gambit
            </h1>
          </div>
        </div>
      </nav>

      <main className="relative z-10 mx-auto grid max-w-6xl gap-12 px-6 py-16 lg:grid-cols-[1.1fr_0.9fr]">
        {isAuthenticated ? (
          <>
            <section className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/10 px-4 py-2 text-sm text-blue-100 backdrop-blur-sm">
                Hauptmenü
              </div>
              <div className="space-y-4">
                <h2 className="text-5xl font-bold leading-tight md:text-6xl">
                  Willkommen, <span className="text-blue-400">{currentUser.user.username}</span>! 🎮
                </h2>
                <p className="max-w-xl text-xl text-slate-300">
                  Erstelle eine Lobby, tritt einer Partie bei oder passe dein Profil an.
                </p>
              </div>

            </section>

            <section className="rounded-3xl border border-blue-500/10 bg-slate-900/25 p-6 shadow-2xl backdrop-blur-md sm:p-8">
              <div className="mb-6 flex items-center gap-3">
                <Image src="/assets/logo.svg" alt="logo" width={32} height={32} loading="eager" className="h-8 w-8 object-contain" />
                <div>
                  <h3 className="text-2xl font-semibold">Spielmenü</h3>
                  <p className="text-sm text-slate-300">Wähle deine Aktion.</p>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <div className="mb-2">
                  {createError && <div className="text-sm text-red-400 mb-2">{createError}</div>}
                </div>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={async () => {
                    setCreateError(null);
                    setIsCreating(true);
                    try {
                      const room = await createRoom();
                      await joinRoom(room, true);
                      router.push(`/room/${room}`);
                    } catch (err) {
                      console.error("Create room failed", err);
                      setCreateError("Fehler beim Erstellen der Lobby. Bitte versuche es erneut.");
                    } finally {
                      setIsCreating(false);
                    }
                  }}
                  disabled={isCreating}
                >
                  {isCreating ? "Erstelle..." : "Spiel erstellen"}
                </Button>

                {!showJoinInput ? (
                  <Button variant="secondary" size="lg" onClick={() => setShowJoinInput(true)} type="button">
                    Lobby beitreten
                  </Button>
                ) : (
                  <div className="flex h-11 min-w-[260px] items-center gap-2 rounded-[10px] border border-slate-200 bg-white p-1.5 shadow-sm">
                    <input
                      placeholder="Room ID oder Link"
                      aria-label="Room ID"
                      value={roomId}
                      onChange={(e) => setRoomId(e.target.value)}
                      className="h-full flex-1 rounded-lg border-0 px-3 text-sm text-slate-800 outline-none"
                    />
                    <div className="flex items-center gap-2">
                      <Button
                        className="w-auto rounded-lg bg-blue-500 px-3 py-2 text-sm font-bold text-white"
                        type="button"
                        onClick={async () => {
                          setJoinError(null);
                          const parsedRoomId = parseRoomId(roomId);
                          if (parsedRoomId == null) {
                            setJoinError("Ungültige Raum-ID oder Link.");
                            return;
                          }

                          setIsJoining(true);
                          try {
                            await joinRoom(parsedRoomId);
                            router.push(`/room/${parsedRoomId}`);
                          } catch (err) {
                            console.error("Join room failed", err);
                            setJoinError("Raum konnte nicht gefunden oder beigetreten werden.");
                          } finally {
                            setIsJoining(false);
                          }
                        }}
                        disabled={parseRoomId(roomId) == null || isJoining}
                      >
                        {isJoining ? "Beitreten..." : "Raum beitreten"}
                      </Button>
                      {joinError && <div className="text-sm text-red-400">{joinError}</div>}
                    </div>
                  </div>
                )}

                <Button variant="default" size="lg" onClick={() => router.push("/settings")}>Einstellungen</Button>
                <Button
                  variant="default"
                  size="lg"
                  onClick={() => window.open(PAYPAL_LINK, "_blank", "noopener,noreferrer")}
                  aria-label="Spenden über PayPal öffnen"
                >
                  Hilf bei der Entwicklung
                </Button>
                <Button variant="destructive" size="lg" onClick={handleLogout}>Abmelden</Button>
              </div>
            </section>
          </>
        ) : (
          <>
            <section className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/10 px-4 py-2 text-sm text-blue-100 backdrop-blur-sm">
                Startseite
              </div>
              <div className="space-y-4">
                <h2 className="text-5xl font-bold leading-tight md:text-6xl">
                  Erobere die Welt
                </h2>
                <p className="max-w-xl text-xl text-slate-300">
                  Strategisches Spiel für Denker. Baue Armeen auf, plane Offensiven und besiege deine Feinde in epischen Schlachten.
                </p>
              </div>
            </section>

            <section className="rounded-3xl border border-blue-500/10 bg-slate-900/25 p-6 shadow-2xl backdrop-blur-md sm:p-8">
              <div className="mb-6 flex items-center gap-3">
                <Image src="/assets/logo.svg" alt="logo" width={32} height={32} loading="eager" className="h-8 w-8 object-contain" />
                <div>
                  <h3 className="text-2xl font-semibold">Spiel starten</h3>
                  <p className="text-sm text-slate-300">Melde dich an oder registriere dich.</p>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <Button variant="primary" size="lg" onClick={() => router.push("/auth/login")}>Login</Button>
                <Button variant="secondary" size="lg" onClick={() => router.push("/auth/register")}>Registrieren</Button>
              </div>
            </section>
          </>
        )}
      </main>

      {/* Info Section - Only show when not logged in */}
      {!isAuthenticated && (
        <div className="bg-slate-800/50 border-y border-slate-700/30 py-16 mt-20 relative z-10">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div className="space-y-2">
                <div className="text-3xl font-bold text-blue-400">2-6</div>
                <p className="text-slate-300">Spieler pro Partie</p>
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-blue-400">~30min</div>
                <p className="text-slate-300">Durchschnittliche Spieldauer</p>
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-blue-400">Online</div>
                <p className="text-slate-300">Multiplayer Echtzeit</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-700/30 py-8 mt-20 relative z-10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left text-slate-400 text-sm">
              <p>© 2026 Caesar&apos;s Gambit - Strategisches Kriegsspiel</p>
              <p className="text-xs text-slate-500 mt-1">Version {APP_VERSION}</p>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <a
                href="https://github.com/dhbw-softwareengineering/caesars-gambit"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
              >
                <Github className="w-4 h-4" />
                GitHub
              </a>
              <span className="text-slate-500">|</span>
              <a href="#" className="text-blue-400 hover:text-blue-300">
                Datenschutz
              </a>
              <span className="text-slate-500">|</span>
              <a href="#" className="text-blue-400 hover:text-blue-300">
                Impressum
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
