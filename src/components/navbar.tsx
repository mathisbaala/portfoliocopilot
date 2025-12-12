"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Home, Sparkles, LogOut, User, Loader2 } from "lucide-react";
import { useAuth } from "@/context/auth-context";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/50 bg-white/80 backdrop-blur-xl shadow-sm">
      <div className="mx-auto flex h-16 sm:h-18 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg sm:text-xl tracking-tight group">
          <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center group-hover:scale-105 transition-all duration-200 shadow-md">
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <span className="bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent hidden sm:inline">
            Portfolio Copilot
          </span>
          <span className="text-blue-600 sm:hidden font-semibold">
            PC
          </span>
        </Link>

        <nav className="hidden md:flex gap-2">
          <Link
            href="/"
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
              pathname === "/" 
                ? "bg-blue-50 text-blue-700 shadow-sm" 
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <Home className="w-4 h-4" />
            <span>Accueil</span>
          </Link>
          {user && (
            <Link
              href="/dashboard"
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                pathname?.startsWith("/dashboard") 
                  ? "bg-blue-50 text-blue-700 shadow-sm" 
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </Link>
          )}
          <Link
            href="/product"
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
              pathname?.startsWith("/product") 
                ? "bg-blue-50 text-blue-700 shadow-sm" 
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <span>Produit ETF</span>
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          {loading ? (
            <div className="flex items-center gap-2 text-slate-500">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
          ) : user ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 text-sm text-slate-700">
                <User className="w-4 h-4" />
                <span className="max-w-[150px] truncate">{user.email}</span>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSignOut}
                className="gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Déconnexion</span>
              </Button>
            </div>
          ) : (
            <>
              <Link href="/login">
                <Button variant="outline" size="default">
                  <span>Connexion</span>
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="default" className="shadow-md hover:shadow-lg">
                  <span className="hidden sm:inline">Créer un compte</span>
                  <span className="sm:hidden">S&apos;inscrire</span>
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
