"use client";

/**
 * Composant autonome pour afficher un dashboard de produit financier
 * Nouvelle version structurée avec des questions à la 1ère personne
 * 
 * Usage:
 * ```tsx
 * import { FinancialProductDashboard } from '@/components/product/financial-product-dashboard';
 * import myProductData from './my-product.json';
 * 
 * export default function Page() {
 *   return <FinancialProductDashboard data={myProductData} />;
 * }
 * ```
 */

import { FinancialProduct } from "@/types/financial-product";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QuestionSection } from "./question-section";
import { Section1What } from "./section-1-what";
import { Section2How } from "./section-2-how";
import { Section3Risk } from "./section-3-risk";
import { Section4Liquidity } from "./section-4-liquidity";
import { Section5Costs } from "./section-5-costs";

interface FinancialProductDashboardProps {
  data: FinancialProduct;
  showBackButton?: boolean;
  className?: string;
}

export function FinancialProductDashboard({
  data,
  showBackButton = true,
  className = "",
}: FinancialProductDashboardProps) {
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);
  
  // Handler pour le bouton "Plus de détails" (à implémenter plus tard)
  const handleMoreDetails = (section: string) => {
    console.log(`Plus de détails pour la section : ${section}`);
    // TODO: Implémenter l'affichage des détails avancés
  };
  
  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-8">
        {/* Bouton retour */}
        {showBackButton && (
          <div className="mb-6">
            <Link href="/dashboard">
              <Button 
                variant="outline" 
                className="flex items-center gap-2 hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Retour au dashboard</span>
              </Button>
            </Link>
          </div>
        )}

        {/* Section 1 : Dans quoi j'investis ? */}
        <QuestionSection 
          question="Dans quoi j'investis ?"
          onMoreDetails={() => handleMoreDetails("what")}
        >
          <Section1What 
            product={data.product}
            typeSpecific={data.typeSpecific}
          />
        </QuestionSection>

        {/* Section 2 : Comment ça marche ? */}
        <QuestionSection 
          question="Comment ça marche ?"
          onMoreDetails={() => handleMoreDetails("how")}
        >
          <Section2How 
            typeSpecific={data.typeSpecific}
            productType={data.productType}
          />
        </QuestionSection>

        {/* Section 3 : Qu'est-ce que je risque ? */}
        <QuestionSection 
          question="Qu'est-ce que je risque ?"
          onMoreDetails={() => handleMoreDetails("risk")}
        >
          <Section3Risk 
            risk={data.risk}
            historicalPerformance={data.historicalPerformance}
            productType={data.productType}
          />
        </QuestionSection>

        {/* Section 4 : Puis-je rentrer / sortir ? */}
        <QuestionSection 
          question="Puis-je entrer / sortir quand je veux ?"
          onMoreDetails={() => handleMoreDetails("liquidity")}
        >
          <Section4Liquidity 
            liquidityAndTrading={data.liquidityAndTrading}
            typeSpecific={data.typeSpecific}
          />
        </QuestionSection>

        {/* Section 5 : Combien ça me coûte ? */}
        <QuestionSection 
          question="Combien ça me coûte ?"
          onMoreDetails={() => handleMoreDetails("costs")}
        >
          <Section5Costs 
            costs={data.costs}
            productType={data.productType}
          />
        </QuestionSection>
        
        {/* Footer disclaimer */}
        <div className="mt-8 p-6 bg-white rounded-lg border border-gray-200">
          <p className="text-xs text-gray-600 text-center">
            Les informations présentées sur cette page sont fournies à titre indicatif uniquement
            et ne constituent pas un conseil en investissement. Veuillez consulter un conseiller
            financier professionnel avant de prendre toute décision d'investissement.
          </p>
        </div>
      </div>
    </div>
  );
}
