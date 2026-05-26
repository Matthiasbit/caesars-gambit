"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import Button from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGetCurrentUser } from "@/components/api/getCurrentUser";
import { useUpdateCurrentUsername } from "@/components/api/updateCurrentUsername";

export default function SettingsPage() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [name, setName] = useState<string | null>(null);
    const [feedback, setFeedback] = useState<string | null>(null);

    const currentUser = useGetCurrentUser();

    const effectiveName = name ?? currentUser.data?.username ?? "";

    const updateUsername = useUpdateCurrentUsername({
        onSuccess: (updatedUser) => {
            queryClient.setQueryData(["currentUser"], updatedUser);
            setName(updatedUser.username);
            setFeedback("Nutzername gespeichert.");
        },
        onError: (error) => {
            setFeedback(error.message);
        },
    });

    const canSave =
        Boolean(currentUser.data) &&
        effectiveName.trim().length > 0 &&
        effectiveName.trim() !== currentUser.data?.username &&
        !updateUsername.isPending;

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setFeedback(null);

        if (!currentUser.data) {
            return;
        }

        updateUsername.mutate({ username: effectiveName });
    };

    if (currentUser.isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
                <div className="flex items-center gap-3 rounded-3xl border border-white/10 bg-white/5 px-6 py-4 shadow-2xl backdrop-blur-md">
                    <Image src="/assets/logo.svg" alt="Caesar's Gambit logo" width={28} height={28} className="h-7 w-7 object-contain" />
                    <span className="text-sm font-medium text-slate-200">Einstellungen werden geladen...</span>
                </div>
            </div>
        );
    }

    if (currentUser.isError) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-6 text-white">
                <div className="max-w-md rounded-3xl border border-white/10 bg-white/5 p-6 text-center shadow-2xl backdrop-blur-md">
                    <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-200/80">Fehler</p>
                    <h1 className="mt-4 text-3xl font-bold">Einstellungen sind gerade nicht verfügbar</h1>
                    <p className="mt-3 text-sm text-slate-300">Bitte lade die Seite neu oder versuche es in ein paar Minuten erneut.</p>
                    <Button className="mt-6" variant="primary" size="lg" onClick={() => window.location.reload()}>
                        Erneut versuchen
                    </Button>
                </div>
            </div>
        );
    }

    if (!currentUser.data) {
        return null;
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

            <main className="relative z-10 mx-auto flex min-h-[calc(100vh-73px)] max-w-6xl items-center px-6 py-16">
                <section className="w-full max-w-xl rounded-3xl border border-blue-500/10 bg-slate-900/25 p-6 shadow-2xl backdrop-blur-md sm:p-8">
                    <div className="mb-6 flex items-center gap-3">
                        <Image src="/assets/logo.svg" alt="logo" width={32} height={32} loading="eager" className="h-8 w-8 object-contain" />
                        <div>
                            <h2 className="text-2xl font-semibold">Einstellungen</h2>
                            <p className="text-sm text-slate-300">Passe deinen Anzeigenamen an.</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-200" htmlFor="username">
                                Anmelde- und Ingame-Name
                            </label>
                            <Input
                                id="username"
                                value={effectiveName}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                                placeholder="Dein Name"
                                aria-label="Spielername"
                                className="border-slate-700/40 bg-slate-950/40 text-white placeholder:text-slate-500"
                            />
                            {feedback && <p className="mt-2 text-sm text-slate-300">{feedback}</p>}
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                            <Button variant="secondary" type="button" className="w-full sm:w-auto" onClick={() => router.push("/")}>
                                Zurück
                            </Button>
                            <Button variant="primary" type="submit" className="w-full sm:w-auto" disabled={!canSave}>
                                {updateUsername.isPending ? "Speichern..." : "Speichern"}
                            </Button>
                        </div>
                    </form>
                </section>
            </main>
        </div>
    );
}