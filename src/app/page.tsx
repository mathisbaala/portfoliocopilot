"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { motion } from "framer-motion";
import { Upload, Sparkles, BarChart3, ArrowRight, Shield, Clock, DollarSign } from "lucide-react";
import { useAuth } from "@/context/auth-context";

export default function HomePage() {
  const { user, loading } = useAuth();
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
      <section className="relative pt-16 sm:pt-20 md:pt-24 pb-20 md:pb-28 px-4 sm:px-6 lg:px-8">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 via-white to-white" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100/20 via-transparent to-transparent" />

        <div className="relative mx-auto max-w-5xl text-center">
          <motion.h1
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight px-2 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 bg-clip-text text-transparent">
              Reprenez le contrôle
            </span>
            <br />
            <span className="text-slate-900">
              de votre patrimoine.
            </span>
          </motion.h1>

          <motion.p
            className="mt-6 text-lg sm:text-xl md:text-2xl text-slate-600 leading-relaxed max-w-3xl mx-auto px-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            Uploadez le DIC d&apos;un produit et obtenez un tableau de bord clair résumant{" "}
            <span className="font-semibold text-blue-700">risques, frais, horizon de détention</span>{" "}
            et scénarios.
          </motion.p>

          <motion.div
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 w-full px-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <Link href={user ? "/dashboard" : "/signup"} className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto group" disabled={loading}>
                {user ? "Accéder au dashboard" : "Créer un compte gratuit"}
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <a href="#how-it-works" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Voir comment ça marche
              </Button>
            </a>
          </motion.div>

          <motion.div
            className="mt-12 flex flex-wrap items-center justify-center gap-6 px-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            {benefits.map((benefit, i) => (
              <div key={i} className="flex items-center gap-2.5 text-sm text-slate-700">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <benefit.icon className="w-4 h-4 text-blue-600" />
                </div>
                <span className="whitespace-nowrap">{benefit.text}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="how-it-works" className="relative w-full px-4 sm:px-6 lg:px-8 py-20 md:py-28">
        <motion.div
          className="text-center mb-12 sm:mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Comment ça marche ?
          </h2>
          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto px-2">
            Trois étapes simples pour transformer vos documents en insights actionnables
          </p>
        </motion.div>

        <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] }}
            >
              <Card className="h-full hover:shadow-premium transition-all duration-300 group cursor-pointer">
                <CardContent className="p-8">
                  <div className={`relative w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    <feature.icon className="w-8 h-8 text-white" />
                    <div className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="flex items-baseline gap-3 mb-3">
                    <span className="text-4xl font-bold text-slate-200 group-hover:text-blue-200 transition-colors">0{i + 1}</span>
                    <h3 className="text-xl font-bold text-slate-900">{feature.title}</h3>
                  </div>
                  <p className="text-base text-slate-600 leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative w-full px-4 sm:px-6 lg:px-8 pb-20 md:pb-28">
        <motion.div
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 p-12 sm:p-16 text-center shadow-premium-lg max-w-6xl mx-auto"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Animated background pattern */}
          <div className="absolute inset-0 bg-grid-white/10" />
          <div className="absolute inset-0 bg-gradient-to-t from-blue-900/20 to-transparent" />
          
          <div className="relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 px-2">
                Prêt à simplifier vos analyses financières ?
              </h2>
              <p className="text-lg sm:text-xl text-white/90 mb-8 max-w-2xl mx-auto px-2">
                Rejoignez les professionnels qui font confiance à Portfolio Copilot
              </p>
              <Link href="/signup">
                <Button 
                  size="lg" 
                  className="bg-white text-blue-700 hover:bg-blue-50 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-200 font-semibold"
                >
                  Créer un compte gratuit
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
