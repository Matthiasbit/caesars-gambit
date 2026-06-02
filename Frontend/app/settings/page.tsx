"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import Button from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGetCurrentUser } from "@/components/api/getCurrentUser";
import { useUpdateCurrentUsername } from "@/components/api/updateCurrentUsername";
import { Spinner } from "@/components/ui/spinner";

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
            <div className="flex min-h-[70vh] items-center justify-center">
                <Spinner></Spinner>
            </div>
        );
    }

    if (currentUser.isError) {
        return (
            <div className="flex min-h-[70vh] items-center justify-center">
                <p>Fehler beim Laden der Einstellungen</p>            </div>
        );
    }

    if (!currentUser.data) {
        return null;
    }

    return (

        <main className="relative z-10 mx-auto flex min-h-[70vh] max-w-6xl items-center px-6">
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
                            Ingame-Name
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
    );
}