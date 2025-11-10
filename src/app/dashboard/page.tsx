import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Upload, FileText, TrendingUp } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="space-y-10 max-w-7xl mx-auto">
      <div className="space-y-3">
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
          Dashboard
        </h1>
        <p className="text-lg text-slate-600">
          Espace de travail prêt à accueillir vos analyses. Les fonctionnalités d&apos;upload et d&apos;analyse de DIC seront ajoutées ici.
        </p>
      </div>

      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { title: "Documents uploadés", icon: FileText, value: "0", color: "from-blue-500 to-blue-600" },
          { title: "Analyses en cours", icon: TrendingUp, value: "0", color: "from-blue-600 to-blue-700" },
          { title: "Prêt à commencer", icon: Upload, value: "—", color: "from-blue-700 to-blue-800" }
        ].map((item, k) => (
          <Card key={k} className="hover:shadow-premium transition-all duration-300">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold text-slate-700">{item.title}</CardTitle>
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-md`}>
                  <item.icon className="w-5 h-5 text-white" />
                </div>
              </div>
            </CardHeader>
            <Separator />
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-slate-900">{item.value}</div>
              <p className="text-sm text-slate-500 mt-2">
                Les indicateurs clés apparaîtront ici
              </p>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
