import { Github, Linkedin, Mail, Sparkles } from "lucide-react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-slate-200/50 bg-gradient-to-b from-white via-slate-50/50 to-slate-100/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-md">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <h3 className="font-bold text-lg bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                Portfolio Copilot
              </h3>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed max-w-xs">
              Simplifiez l&apos;analyse de vos produits financiers grâce à l&apos;intelligence artificielle.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-slate-900 mb-4">Liens rapides</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/" className="text-slate-600 hover:text-blue-600 transition-colors duration-200 inline-flex items-center gap-1 group">
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                  <span>Accueil</span>
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-slate-600 hover:text-blue-600 transition-colors duration-200 inline-flex items-center gap-1 group">
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                  <span>Dashboard</span>
                </Link>
              </li>
              <li>
                <a href="#how-it-works" className="text-slate-600 hover:text-blue-600 transition-colors duration-200 inline-flex items-center gap-1 group">
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                  <span>Comment ça marche</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-semibold text-slate-900 mb-4">Suivez-nous</h4>
            <div className="flex gap-3">
              <a
                href="#"
                className="w-11 h-11 rounded-xl bg-slate-100 hover:bg-gradient-to-br hover:from-blue-600 hover:to-blue-700 flex items-center justify-center text-slate-600 hover:text-white transition-all duration-200 shadow-sm hover:shadow-md hover:scale-105 group"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-11 h-11 rounded-xl bg-slate-100 hover:bg-gradient-to-br hover:from-blue-600 hover:to-blue-700 flex items-center justify-center text-slate-600 hover:text-white transition-all duration-200 shadow-sm hover:shadow-md hover:scale-105 group"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-11 h-11 rounded-xl bg-slate-100 hover:bg-gradient-to-br hover:from-blue-600 hover:to-blue-700 flex items-center justify-center text-slate-600 hover:text-white transition-all duration-200 shadow-sm hover:shadow-md hover:scale-105 group"
                aria-label="Email"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-200/50 text-center">
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} Portfolio Copilot. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
}
