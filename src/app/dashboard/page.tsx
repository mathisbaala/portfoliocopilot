import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function DashboardPage() {
  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="mt-2 text-slate-600">Espace de travail vide pour l'instant. Les fonctionnalités d'upload et d'analyse de DIC seront ajoutées ici.</p>
      </div>

      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[1,2,3].map((k) => (
          <Card key={k}>
            <CardHeader>
              <CardTitle>Carte {k}</CardTitle>
            </CardHeader>
            <Separator />
            <CardContent className="p-6 text-sm text-slate-600">
              Placeholder. À remplacer par des indicateurs clés: émetteur, niveau de risque, frais, horizon, scénarios.
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
