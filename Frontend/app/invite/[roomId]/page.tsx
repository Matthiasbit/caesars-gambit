"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { joinRoom } from "@/components/api/joinRoom";
import { useGetCurrentUser } from "@/components/api/getCurrentUser";
import { Spinner } from "@/components/ui/spinner";
import { buildAuthRedirectUrl, buildInvitePath } from "@/lib/invite";
import { AUTH_LOGIN_REASONS } from "@/lib/authMessages";

export default function InviteRoomPage() {
  const router = useRouter();
  const { roomId } = useParams() as { roomId?: string };
  const currentUser = useGetCurrentUser();
  const joinAttemptedRef = useRef(false);
  const [joinError, setJoinError] = useState<string | null>(null);

  const parsedRoomId = roomId && /^\d+$/.test(roomId) ? Number(roomId) : null;
  const invitePath = parsedRoomId != null ? buildInvitePath(parsedRoomId) : "/";
  const hasUser = currentUser.isSuccess && Boolean(currentUser.data);

  useEffect(() => {
    if (!parsedRoomId || currentUser.isLoading || !hasUser || joinAttemptedRef.current) {
      return;
    }

    joinAttemptedRef.current = true;

    const join = async () => {
      setJoinError(null);
      try {
        await joinRoom(parsedRoomId);
        router.replace(`/room/${parsedRoomId}`);
      } catch (error) {
        console.error("Invite join failed", error);
        joinAttemptedRef.current = false;
        setJoinError("Der Invite ist ungültig.");
      }
    };

    void join();
  }, [currentUser.isLoading, hasUser, parsedRoomId, router]);

  useEffect(() => {
    if (!parsedRoomId || currentUser.isLoading || !currentUser.isSuccess || hasUser) {
      return;
    }

    const redirectTo = `${window.location.pathname}${window.location.search}`;
    router.replace(buildAuthRedirectUrl("/auth/login", redirectTo, AUTH_LOGIN_REASONS.inviteJoin));
  }, [currentUser.isLoading, currentUser.isSuccess, hasUser, parsedRoomId, router]);

  if (currentUser.isError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-80 pointer-events-none">
          <Image src="/assets/Karte-neutral.svg" alt="Map background" fill sizes="100vw" priority className="object-cover" />
        </div>
        <main className="relative z-10 mx-auto flex min-h-screen max-w-4xl items-center justify-center px-6 py-16">
          <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-white/5 p-8 text-center shadow-2xl backdrop-blur-md">
            <h1 className="text-3xl font-bold">Session konnte nicht geprüft werden</h1>
            <p className="mt-3 text-sm text-slate-300">Bitte versuche es in ein paar Minuten erneut.</p>
            <Link href="/" className="mt-6 inline-flex items-center justify-center rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/90 hover:bg-white/10">
              Zur Startseite
            </Link>
          </div>
        </main>
      </div>
    );
  }

  if (!parsedRoomId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-80 pointer-events-none">
          <Image src="/assets/Karte-neutral.svg" alt="Map background" fill sizes="100vw" priority className="object-cover" />
        </div>
        <main className="relative z-10 mx-auto flex min-h-screen max-w-4xl items-center justify-center px-6 py-16">
          <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-white/5 p-8 text-center shadow-2xl backdrop-blur-md">
            <h1 className="text-3xl font-bold">Invite ist ungültig</h1>
            <p className="mt-3 text-sm text-slate-300">Der Link enthält keine gültige Raum-ID.</p>
            <Link href="/" className="mt-6 inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/90 hover:bg-white/10">
              Zur Startseite
            </Link>
          </div>
        </main>
      </div>
    );
  }

  if (currentUser.isLoading || (hasUser && !joinError)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-80 pointer-events-none">
          <Image src="/assets/Karte-neutral.svg" alt="Map background" fill sizes="100vw" priority className="object-cover" />
        </div>
        <main className="relative z-10 mx-auto flex min-h-screen max-w-4xl items-center justify-center px-6 py-16">
          <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-white/5 p-8 text-center shadow-2xl backdrop-blur-md">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-blue-400/20 bg-blue-400/10">
              <Spinner className="size-6 text-blue-300" />
            </div>
            <h1 className="text-3xl font-bold">Invite wird geöffnet</h1>
            <p className="mt-3 text-sm text-slate-300">{currentUser.isLoading ? "Session wird geprüft." : "Du wirst der Lobby beitreten."}</p>
            <p className="mt-2 text-xs text-slate-400">{invitePath}</p>
          </div>
        </main>
      </div>
    );
  }

  if (joinError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-80 pointer-events-none">
          <Image src="/assets/Karte-neutral.svg" alt="Map background" fill sizes="100vw" priority className="object-cover" />
        </div>
        <main className="relative z-10 mx-auto flex min-h-screen max-w-4xl items-center justify-center px-6 py-16">
          <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-white/5 p-8 text-center shadow-2xl backdrop-blur-md">
            <h1 className="text-3xl font-bold">Invite konnte nicht geladen werden</h1>
            <p className="mt-3 text-sm text-slate-300">{joinError}</p>
            <Link href="/" className="mt-6 inline-flex items-center justify-center rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/90 hover:bg-white/10">
              Zur Startseite
            </Link>
          </div>
        </main>
      </div>
    );
  }
 
  return null;
}