"use client";

import { createBrowserClient } from "@/lib/supabase-browser";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Mail, Sparkles, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const supabase = createBrowserClient();
    const { error } = await supabase.auth.signInWithOtp({ 
      email, 
      options: { emailRedirectTo: `${location.origin}/dashboard` } 
    });
    setLoading(false);
    if (error) toast.error(error.message);
    else toast.success("Lien de connexion envoyé ! Vérifiez votre boîte email.");
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-50 to-blue-100/50 border border-blue-200/50 text-blue-700 text-sm font-semibold mb-4 shadow-sm">
            <Sparkles className="w-4 h-4" />
            <span>Connexion sécurisée</span>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            Bienvenue
          </h1>
          <p className="mt-2 text-slate-600">
            Connectez-vous pour accéder à votre tableau de bord
          </p>
        </div>

        <Card className="shadow-premium">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Mail className="w-5 h-5 text-blue-600" />
              <span>Connexion par email</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold text-slate-700">
                  Adresse email
                </Label>
                <Input 
                  id="email"
                  type="email" 
                  placeholder="votre@email.com" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                  disabled={loading}
                />
              </div>
              <Button 
                type="submit" 
                className="w-full group"
                size="lg"
                disabled={loading}
              >
                {loading ? "Envoi en cours..." : "Envoyer le lien magique"}
                {!loading && <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />}
              </Button>
            </form>
            <p className="mt-4 text-xs text-center text-slate-500">
              Vous recevrez un email avec un lien de connexion sécurisé
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
