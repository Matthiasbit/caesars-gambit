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
import { parseInviteRoomId } from "@/lib/invite";



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

  const handleLogout = async () => {
    try {
      await signOut();
      window.location.assign("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (currentUser.isLoading) {
    return (
      <div className="flex items-center justify-center">
        <div className="flex items-center">
          <Spinner className="size-5 text-blue-300" />
        </div>
      </div>
    );
  }

  if (currentUser.status === "error") {
    return (
      <div className="flex  items-center justify-center px-6 text-white">
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
    <div className=" overflow-x-hidden">
      <main className="relative z-10 mx-auto grid max-w-6xl gap-12 px-6 py-16 lg:grid-cols-[1.1fr_0.9fr]">
        {currentUser.isSuccess && currentUser.data ? (
          <>
            <section className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/10 px-4 py-2 text-sm text-blue-100 backdrop-blur-sm">
                Hauptmenü
              </div>
              <div className="space-y-4">
                <h2 className="text-5xl font-bold leading-tight md:text-6xl">
                  Willkommen, <span className="text-blue-400">{currentUser.data.username}</span>! 🎮
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
                      placeholder="Invite-Link oder Raum-ID"
                      aria-label="Invite-Link oder Raum-ID"
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
                          const parsedRoomId = parseInviteRoomId(roomId);
                          if (parsedRoomId == null) {
                            setJoinError("Ungültiger Invite-Link oder Raum-ID.");
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
                        disabled={parseInviteRoomId(roomId) == null || isJoining}
                      >
                          {isJoining ? "Beitreten..." : "Invite beitreten"}
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
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => {
                    const redirectTo = `${window.location.pathname}${window.location.search}`;
                    router.push(`/auth/login?redirectTo=${encodeURIComponent(redirectTo)}`);
                  }}
                >
                  Login
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={() => {
                    const redirectTo = `${window.location.pathname}${window.location.search}`;
                    router.push(`/auth/register?redirectTo=${encodeURIComponent(redirectTo)}`);
                  }}
                >
                  Registrieren
                </Button>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
