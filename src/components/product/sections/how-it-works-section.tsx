"use client";

import { TypeSpecific } from "@/types/financial-product";
import { TrendingUp, TrendingDown, Info } from "lucide-react";

interface HowItWorksSectionProps {
  typeSpecific?: TypeSpecific;
  productType?: string;
}

/**
 * Section 2 : Comment ça marche ?
 * Explique le fonctionnement détaillé du produit
 */
export function HowItWorksSection({ typeSpecific, productType = "ETF" }: HowItWorksSectionProps) {
  // Placeholder si les données ne sont pas fournies
  if (!typeSpecific) {
    return (
      <div className="p-8 bg-slate-50 rounded-xl border-2 border-dashed border-slate-300">
        <p className="text-center text-slate-600 text-sm">
          📋 Données du produit manquantes
        </p>
      </div>
    );
  }

  // Contenu adapté selon le type de produit
  const getProductExplanation = () => {
    if (productType === "ETF" && typeSpecific.managementStyle === "PASSIVE") {
      return {
        title: "Un produit simple qui réplique un indice",
        description: "Un ETF (Exchange Traded Fund) est un fonds coté en bourse qui reproduit fidèlement la performance d'un indice boursier.",
        howItWorks: typeSpecific.index 
          ? `Cet ETF réplique l'indice ${typeSpecific.index.name}. Cela signifie qu'il investit dans les mêmes entreprises qui composent cet indice, dans les mêmes proportions.`
          : "Cet ETF suit un indice de référence en investissant dans les mêmes valeurs.",
      };
    }
    
    return {
      title: "Un produit de placement collectif",
      description: "Ce produit mutualise l'épargne de plusieurs investisseurs pour investir sur les marchés financiers.",
      howItWorks: "Le gestionnaire sélectionne et gère un portefeuille de valeurs mobilières selon la stratégie définie.",
    };
  };

  const explanation = getProductExplanation();

  return (
    <div className="space-y-6">
      {/* Explication du type de produit */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {explanation.title}
        </h3>
        <p className="text-gray-700 leading-relaxed">
          {explanation.description}
        </p>
      </div>

      {/* Comment ça fonctionne */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <div className="flex items-start gap-2">
          <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <p className="text-gray-800 text-sm leading-relaxed">
            {explanation.howItWorks}
          </p>
        </div>
      </div>

      {/* Exemples concrets */}
      <div className="space-y-4">
        <h4 className="font-semibold text-gray-900">Exemples concrets :</h4>
        
        {/* Scénario optimiste */}
        <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
          <TrendingUp className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-green-900 mb-1">Scénario favorable</p>
            <p className="text-sm text-gray-700">
              {typeSpecific.index 
                ? `Si l'indice ${typeSpecific.index.name.split(' ')[0]} prend +10%, alors votre investissement dans cet ETF augmente également d'environ +10%.`
                : "Si les marchés progressent de +10%, votre investissement suit cette tendance à la hausse."}
            </p>
          </div>
        </div>

        {/* Scénario pessimiste */}
        <div className="flex items-start gap-3 p-4 bg-red-50 rounded-lg border border-red-200">
          <TrendingDown className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-red-900 mb-1">Scénario défavorable</p>
            <p className="text-sm text-gray-700">
              {typeSpecific.index 
                ? `Si l'indice ${typeSpecific.index.name.split(' ')[0]} baisse de -10%, alors votre investissement dans cet ETF perd également environ -10%.`
                : "Si les marchés reculent de -10%, votre investissement subit également cette baisse."}
            </p>
          </div>
        </div>
      </div>

      {/* Méthode de réplication (pour ETF) */}
      {typeSpecific.replicationMethod && (
        <div className="pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            <span className="font-medium">Méthode de réplication :</span>{" "}
            {typeSpecific.replicationMethod === "PHYSICAL" 
              ? "Réplication physique (achat direct des titres de l'indice)"
              : "Réplication synthétique (utilisation de produits dérivés)"}
          </p>
        </div>
      )}
    </div>
  );
}
