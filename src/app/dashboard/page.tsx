import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Upload, FileText, TrendingUp, ArrowRight } from "lucide-react";
import Link from "next/link";
import { availableProducts } from "@/config/products";

export default function DashboardPage() {
  return (
    <div className="space-y-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
          { title: "Prêt à commencer", icon: Upload, value: availableProducts.length.toString(), color: "from-blue-700 to-blue-800" }
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
                {item.title === "Prêt à commencer" 
                  ? `${availableProducts.length} produits disponibles` 
                  : "Les DIC prêts à être consultés apparaîtront ici."}
              </p>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* Section Prêt à commencer - Liste des produits */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Prêt à étudier</h2>
            <p className="text-slate-600 mt-1">
              Les DIC prêts à être consultés apparaîtront ici.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {availableProducts.map((product) => (
            <Link
              key={product.id}
              href={`/product/${product.id}`}
              className="group"
            >
              <Card className="hover:shadow-lg transition-all duration-300 hover:border-blue-500 cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-slate-900 group-hover:text-blue-600 transition-colors">
                        {product.frontendProductName}
                      </h3>
                      <p className="text-sm text-slate-500 mt-1">
                        Consulter le dashboard
                      </p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
