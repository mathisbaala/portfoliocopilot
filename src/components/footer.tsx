import { Github, Linkedin, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-gradient-to-b from-white to-slate-50">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <h3 className="font-bold text-lg text-blue-600 mb-3">
              Portfolio Copilot
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Simplifiez l'analyse de vos produits financiers grâce à l'intelligence artificielle.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-slate-900 mb-3">Liens rapides</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/" className="text-slate-600 hover:text-blue-600 transition-colors">
                  Accueil
                </a>
              </li>
              <li>
                <a href="/dashboard" className="text-slate-600 hover:text-blue-600 transition-colors">
                  Dashboard
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="text-slate-600 hover:text-blue-600 transition-colors">
                  Comment ça marche
                </a>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-semibold text-slate-900 mb-3">Suivez-nous</h4>
            <div className="flex gap-3">
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-slate-100 hover:bg-blue-600 flex items-center justify-center text-slate-600 hover:text-white transition-all group"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-slate-100 hover:bg-blue-600 flex items-center justify-center text-slate-600 hover:text-white transition-all group"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-slate-100 hover:bg-blue-600 flex items-center justify-center text-slate-600 hover:text-white transition-all group"
                aria-label="Email"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-200 text-center">
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} Portfolio Copilot. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
}
