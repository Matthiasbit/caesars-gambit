import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AuthGuard from '@/components/AuthGuard';
import Providers from "./providers";
import { Header } from "@/components/ui/header";
import Image from "next/image";
import { Github } from "lucide-react";

import packageJson from "@/package.json";
const APP_VERSION = packageJson.version;

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Caesar's Gambit",
  description: "Strategic board game",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#0e1624] `}
      >
        <Providers >
          <AuthGuard>
            <div className="relative min-h-[calc(100vh-12rem)]">
              <div className="fixed inset-0 z-0 opacity-30 pointer-events-none">
                <Image
                  src="/assets/Karte-neutral.svg"
                  alt="Map background"
                  fill
                  sizes="100vw"
                  priority
                  className="object-cover"
                />
              </div>
              <div className="fixed right-10 top-20 z-0 h-64 w-64 opacity-10 pointer-events-none">
                <Image
                  src="/assets/logo.svg"
                  alt="Logo background"
                  fill
                  sizes="256px"
                  loading="eager"
                  className="object-contain"
                />
              </div>
              <div className="relative z-10 flex flex-col">
                <Header />
                <main className="flex-1">
                  {children}
                </main>
              </div>
            </div>
          </AuthGuard>
        </Providers>
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
      </body>
    </html>
  );
}
