"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Home, Sparkles } from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-lg shadow-sm">
      <div className="mx-auto flex h-14 sm:h-16 w-full items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-1.5 sm:gap-2 font-bold text-base sm:text-xl tracking-tight group">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <span className="text-blue-600 hidden xs:inline">
            Portfolio Copilot
          </span>
          <span className="text-blue-600 xs:hidden">
            portfolio copilot
          </span>
        </Link>

        <nav className="hidden sm:flex gap-1">
          <Link
            href="/"
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
              pathname === "/" 
                ? "bg-blue-50 text-blue-700" 
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <Home className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden md:inline">Accueil</span>
          </Link>
          <Link
            href="/dashboard"
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
              pathname?.startsWith("/dashboard") 
                ? "bg-blue-50 text-blue-700" 
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden md:inline">Dashboard</span>
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/dashboard">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all text-xs sm:text-sm px-3 sm:px-4 py-2 h-9 sm:h-10">
              <span className="hidden sm:inline">Accéder au dashboard</span>
              <span className="sm:hidden">Dashboard</span>
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
