"use client";

import { AuthForm } from "@/components/auth";
import { Sparkles } from "lucide-react";

export default function SignupPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-50 to-blue-100/50 border border-blue-200/50 text-blue-700 text-sm font-semibold mb-4 shadow-sm">
            <Sparkles className="w-4 h-4" />
            <span>Créez votre compte</span>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            Rejoignez-nous
          </h1>
          <p className="mt-2 text-slate-600">
            Créez votre compte pour analyser vos produits financiers
          </p>
        </div>

        <AuthForm defaultMode="signup" />
      </div>
    </div>
  );
}
