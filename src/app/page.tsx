import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="space-y-16">
      <section className="pt-10">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl">
            Comprendre un produit financier en quelques secondes
          </h1>
          <p className="mt-6 text-lg text-slate-600">
            Uploadez le DIC d'un produit et obtenez un tableau de bord clair résumant risques, frais, horizon de détention et scénarios.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Link href="/dashboard">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">Accéder au dashboard</Button>
            </Link>
            <Link href="#how-it-works" className="text-blue-700 text-sm font-medium hover:text-blue-800">
              Voir comment ça marche
            </Link>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="grid gap-6 sm:grid-cols-3">
        {["Uploader un DIC", "Extraction automatique", "Synthèse claire"].map((title, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-sm text-slate-600">
                Section placeholder. L'implémentation viendra dans les itérations suivantes.
              </p>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
