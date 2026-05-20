"use client";
import React, { useEffect, useState } from "react";
import Button from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {useRouter} from "next/navigation";
import { useGetCurrentUser } from "@/components/api/getCurrentUser";

export default function SettingsPage() {
    const router = useRouter();
    const [name, setName] = useState("");

    const currentUser = useGetCurrentUser();

    useEffect(() => {
        if (currentUser.isSuccess && currentUser.data) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setName(currentUser.data.username);
        }
    }, [currentUser]);

    return (
        <main className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
            <div className="w-full max-w-lg bg-white rounded-lg shadow p-6">
                <h1 className="text-xl font-semibold mb-4">Einstellungen</h1>

                <section className="mb-4">
                    <label className="block text-sm font-medium mb-2">Anmelde- und Ingamename</label>
                    <div className="flex gap-2">
                        <Input value={name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)} placeholder="Dein Name" aria-label="Spielername" />
                        <Button variant="primary" type="button">Speichern</Button>
                    </div>
                </section>

                <section className="mb-6">
                    <label className="block text-sm font-medium mb-2">Farbe</label>
                    <div className="flex items-center gap-2">
                        <button className="w-8 h-8 rounded-full bg-blue-500" aria-label="Blau" />
                        <button className="w-8 h-8 rounded-full bg-red-500" aria-label="Rot" />
                        <button className="w-8 h-8 rounded-full bg-green-500" aria-label="Grün" />
                        <button className="w-8 h-8 rounded-full bg-purple-500" aria-label="Lila" />
                        <button className="w-8 h-8 rounded-full bg-amber-500" aria-label="Amber" />
                    </div>
                </section>

                <div className="flex justify-end gap-2">
                    <Button variant="secondary" type="button">Zurücksetzen</Button>
                    <Button variant="destructive" type="button" onClick={() => router.push("/")}>Schließen</Button>
                </div>
            </div>
        </main>
    );
}