'use client'

import Image from "next/image"
import Link from "next/link"

export function Header() {
  return (
    <nav className="relative z-10 border-b border-slate-700/30 bg-slate-900/50 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <Image src="/assets/logo.svg" alt="Caesar's Gambit logo" width={32} height={32} loading="eager" className="w-8 h-8 object-contain" />
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-300 bg-clip-text text-transparent">
            Caesar&apos;s Gambit
          </h1>
        </Link>
      </div>
    </nav>
  )
}
