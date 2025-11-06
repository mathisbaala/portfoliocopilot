"use client";

import { createBrowserClient } from "@/lib/supabase-browser";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function LoginPage() {
  const [email, setEmail] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const supabase = createBrowserClient();
    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: `${location.origin}/dashboard` } });
    if (error) toast.error(error.message);
    else toast.success("Lien de connexion envoyé");
  }

  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-2xl font-semibold">Connexion</h1>
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <Input type="email" placeholder="Votre email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <Button className="bg-blue-600 hover:bg-blue-700 text-white" type="submit">Envoyer un lien magique</Button>
      </form>
    </div>
  );
}
