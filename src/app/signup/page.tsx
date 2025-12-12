"use client";

import { AuthForm } from "@/components/auth";

export default function SignupPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
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
