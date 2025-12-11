"use client";

import { useState } from "react";
import { FinancialProduct } from "@/types/financial-product";
import {
  InvestmentSection,
  HowItWorksSection,
  RiskSection,
  LiquiditySection,
  FeesSection,
} from "./sections";

// Configuration des sections de navigation
const SECTIONS = [
  {
    id: "investment",
    title: "Dans quoi j'investis ?",
    subtitle: "Composition et objectif",
  },
  {
    id: "how-it-works",
    title: "Comment ça marche ?",
    subtitle: "Fonctionnement détaillé",
  },
  {
    id: "risk",
    title: "Qu'est-ce que je risque ?",
    subtitle: "Évaluation des risques",
  },
  {
    id: "liquidity",
    title: "Puis-je entrer et sortir quand je veux ?",
    subtitle: "Conditions de liquidité",
  },
  {
    id: "fees",
    title: "Combien ça me coûte ?",
    subtitle: "Structure des frais",
  },
] as const;

type SectionId = (typeof SECTIONS)[number]["id"];

interface ProductEtfDashboardV2Props {
  data: FinancialProduct;
}

export function ProductEtfDashboardV2({ data }: ProductEtfDashboardV2Props) {
  // État pour gérer la section active (par défaut: première section)
  const [activeSection, setActiveSection] = useState<SectionId>("investment");

  // Fonction pour rendre le contenu de la section active avec les bonnes props
  const renderActiveSection = () => {
    switch (activeSection) {
      case "investment":
        return <InvestmentSection product={data.product} typeSpecific={data.typeSpecific} />;
      case "how-it-works":
        return <HowItWorksSection typeSpecific={data.typeSpecific} productType={data.productType} />;
      case "risk":
        return (
          <RiskSection
            risk={data.risk}
            historicalPerformance={data.historicalPerformance}
            productType={data.productType}
            distributorName={data.distributorName}
          />
        );
      case "liquidity":
        return <LiquiditySection liquidityAndTrading={data.liquidityAndTrading} typeSpecific={data.typeSpecific} />;
      case "fees":
        return <FeesSection costs={data.costs} productType={data.productType} />;
      default:
        return <InvestmentSection product={data.product} typeSpecific={data.typeSpecific} />;
    }
  };

  // Trouver le titre de la section active pour l'afficher
  const activeSectionTitle = SECTIONS.find((s) => s.id === activeSection)?.title;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Navigation à gauche (desktop) / en haut (mobile) */}
          <aside className="lg:w-1/4 lg:sticky lg:top-8 lg:self-start">
            {/* Version mobile: pills horizontales scrollables */}
            <div className="lg:hidden overflow-x-auto pb-4">
              <div className="flex gap-3 min-w-max px-1">
                {SECTIONS.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    aria-current={activeSection === section.id ? "true" : undefined}
                    className={`
                      flex-shrink-0 px-5 py-3 rounded-full text-sm font-medium
                      transition-all duration-200 whitespace-nowrap
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                      ${
                        activeSection === section.id
                          ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                          : "bg-white text-slate-700 hover:bg-slate-100 shadow-sm"
                      }
                    `}
                  >
                    {section.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Version desktop: liste verticale */}
            <nav className="hidden lg:block space-y-2" aria-label="Sections du produit">
              {SECTIONS.map((section, index) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  aria-current={activeSection === section.id ? "true" : undefined}
                  className={`
                    w-full text-left px-5 py-4 rounded-xl
                    transition-all duration-200
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                    ${
                      activeSection === section.id
                        ? "bg-white shadow-lg border-2 border-blue-500"
                        : "bg-white/60 hover:bg-white hover:shadow-md border-2 border-transparent"
                    }
                  `}
                >
                  {/* Numéro de section */}
                  <div className="flex items-start gap-3">
                    <div
                      className={`
                        flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold
                        ${
                          activeSection === section.id
                            ? "bg-blue-600 text-white"
                            : "bg-slate-200 text-slate-600"
                        }
                      `}
                      aria-hidden="true"
                    >
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div
                        className={`
                          text-sm font-semibold leading-tight mb-1
                          ${activeSection === section.id ? "text-blue-900" : "text-slate-900"}
                        `}
                      >
                        {section.title}
                      </div>
                      <div
                        className={`
                          text-xs
                          ${activeSection === section.id ? "text-blue-700" : "text-slate-500"}
                        `}
                      >
                        {section.subtitle}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </nav>
          </aside>

          {/* Panneau de contenu à droite */}
          <main className="flex-1 lg:w-3/4">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              {/* En-tête de la section active */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-6 sm:px-8 sm:py-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-white">
                  {activeSectionTitle}
                </h2>
              </div>

              {/* Contenu avec transition douce */}
              <div
                key={activeSection}
                className="p-6 sm:p-8 animate-in fade-in slide-in-from-bottom-4 duration-300"
              >
                {renderActiveSection()}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
