"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";

export function Navbar() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="font-semibold tracking-tight">
          <span className="text-blue-700">Portfolio</span> Copilot
        </Link>

        <nav className="hidden gap-6 sm:flex">
          <Link
            href="/"
            className={`text-sm ${pathname === "/" ? "text-blue-700" : "text-slate-600 hover:text-slate-900"}`}
          >
            Accueil
          </Link>
          <Link
            href="/dashboard"
            className={`text-sm ${pathname?.startsWith("/dashboard") ? "text-blue-700" : "text-slate-600 hover:text-slate-900"}`}
          >
            Dashboard
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/dashboard">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">Accéder au dashboard</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
