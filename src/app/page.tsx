"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { motion } from "framer-motion";
import { Upload, Sparkles, BarChart3, ArrowRight, Shield, Clock, DollarSign } from "lucide-react";

export default function HomePage() {
  const features = [
      {
      icon: Upload,
      title: "Uploader un DIC",
      description: "Glissez-déposez votre document d'information clé pour commencer l'analyse en un instant.",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: Sparkles,
      title: "Extraction automatique",
      description: "Notre IA analyse et extrait automatiquement toutes les informations clés de votre document.",
      color: "from-blue-600 to-blue-700"
    },
    {
      icon: BarChart3,
      title: "Synthèse claire",
      description: "Visualisez instantanément les risques, frais et scénarios dans un tableau de bord intuitif.",
      color: "from-blue-700 to-blue-800"
    }
  ];

  const benefits = [
    { icon: Shield, text: "Analyse des risques" },
    { icon: DollarSign, text: "Transparence des frais" },
    { icon: Clock, text: "Horizon de détention" },
  ];

  return (
    <div className="w-full overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-12 sm:pt-16 md:pt-20 pb-16 md:pb-24 px-4 sm:px-6 lg:px-8">

        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs sm:text-sm font-medium mb-4 sm:mb-6">
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Powered by AI</span>
            </div>
          </motion.div>

          <motion.h1
            className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-extrabold tracking-tight text-blue-700 px-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Reprenez le contrôle de votre patrimoine.
          </motion.h1>

          <motion.p
            className="mt-4 sm:mt-6 text-base sm:text-lg md:text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto px-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Uploadez le DIC d'un produit et obtenez un tableau de bord clair résumant risques, frais, horizon de détention et scénarios.
          </motion.p>

          <motion.div
            className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full px-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Link href="/dashboard" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all group">
                Accéder au dashboard
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <a href="#how-it-works" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto border-2 border-slate-300 hover:border-blue-600 hover:text-blue-600">
                Voir comment ça marche
              </Button>
            </a>
          </motion.div>

          <motion.div
            className="mt-8 sm:mt-12 flex flex-wrap items-center justify-center gap-4 sm:gap-6 px-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            {benefits.map((benefit, i) => (
              <div key={i} className="flex items-center gap-2 text-xs sm:text-sm text-slate-600">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <benefit.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" />
                </div>
                <span className="whitespace-nowrap">{benefit.text}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="how-it-works" className="relative w-full px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <motion.div
          className="text-center mb-8 sm:mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 mb-3 sm:mb-4">
            Comment ça marche ?
          </h2>
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto px-2">
            Trois étapes simples pour transformer vos documents en insights actionnables
          </p>
        </motion.div>

        <div className="grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Card className="h-full border-2 hover:border-blue-300 transition-all hover:shadow-xl group">
                <CardContent className="p-6 sm:p-8">
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform`}>
                    <feature.icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                  </div>
                  <div className="flex items-center gap-2 mb-2 sm:mb-3">
                    <span className="text-2xl sm:text-3xl font-bold text-slate-300">0{i + 1}</span>
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900">{feature.title}</h3>
                  </div>
                  <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative w-full px-4 sm:px-6 lg:px-8 pb-16 md:pb-24">
        <motion.div
          className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-blue-600 p-8 sm:p-12 text-center shadow-2xl max-w-7xl mx-auto"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="absolute inset-0 bg-grid-white/10" />
          <div className="relative z-10">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4 px-2">
              Prêt à simplifier vos analyses financières ?
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-white/90 mb-6 sm:mb-8 max-w-2xl mx-auto px-2">
              Rejoignez les professionnels qui font confiance à Portfolio Copilot
            </p>
            <Link href="/dashboard">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 shadow-lg hover:shadow-xl transition-all">
                Commencer maintenant
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
