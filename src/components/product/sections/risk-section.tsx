"use client";

import { Risk, HistoricalPerformance } from "@/types/financial-product";
import { AlertTriangle, Shield, TrendingDown } from "lucide-react";

interface RiskSectionProps {
  risk?: Risk;
  historicalPerformance?: HistoricalPerformance;
  productType?: string;
  distributorName?: string;
}

/**
 * Section 3 : Qu'est-ce que je risque ?
 * Détaille l'évaluation et les indicateurs de risque
 */
export function RiskSection({ risk, historicalPerformance, productType = "ETF", distributorName }: RiskSectionProps) {
  // Placeholder si les données ne sont pas fournies
  if (!risk) {
    return (
      <div className="p-8 bg-slate-50 rounded-xl border-2 border-dashed border-slate-300">
        <p className="text-center text-slate-600 text-sm">
          📋 Données de risque manquantes
        </p>
      </div>
    );
  }

  // Générer l'échelle de risque 1-7
  const riskScale = Array.from({ length: 7 }, (_, i) => i + 1);
  
  // Texte descriptif selon le niveau de risque
  const getRiskDescription = (level: number) => {
    if (level <= 2) return "Risque faible";
    if (level <= 4) return "Risque modéré";
    if (level <= 5) return "Risque moyennement élevé";
    return "Risque élevé";
  };

  // Messages généraux selon le type de produit
  const getGeneralRiskInfo = () => {
    if (productType === "ETF") {
      return {
        title: "Aucune protection du capital",
        description: "Comme tous les ETF, ce produit n'offre aucune garantie de capital. Vous pouvez potentiellement perdre tout ou partie de votre investissement initial, si l'indice réplique connaît une forte baisse.",
        icon: AlertTriangle,
        bgColor: "bg-red-50",
        borderColor: "border-red-200",
        iconColor: "text-red-600",
      };
    }
    return {
      title: "Risque de perte en capital",
      description: "Ce produit n'offre pas de garantie de capital. Vous pouvez perdre tout ou partie de votre investissement.",
      icon: AlertTriangle,
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      iconColor: "text-red-600",
    };
  };

  const generalRisk = getGeneralRiskInfo();
  const IconComponent = generalRisk.icon;

  return (
    <div className="space-y-6">
      {/* Indicateur de risque DIC (1-7) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">Indicateur de risque</h3>
          <span className="text-sm font-medium text-gray-600">
            {getRiskDescription(risk.riskIndicator)}
          </span>
        </div>
        
        {/* Échelle visuelle 1-7 */}
        <div className="flex gap-1 mb-2">
          {riskScale.map((level) => {
            const isActive = level <= risk.riskIndicator;
            const getColor = () => {
              if (!isActive) return "bg-gray-200";
              if (level <= 2) return "bg-green-500";
              if (level <= 4) return "bg-yellow-500";
              if (level <= 5) return "bg-orange-500";
              return "bg-red-500";
            };
            
            return (
              <div
                key={level}
                className={`flex-1 h-8 ${getColor()} rounded transition-all ${
                  isActive ? "opacity-100" : "opacity-100"
                }`}
              >
                <div className="flex items-center justify-center h-full">
                  <span className={`text-xs font-bold ${isActive ? "text-white" : "text-gray-500"}`}>
                    {level}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="space-y-1">
          <p className="text-xs text-gray-600 text-center">
            Échelle de risque : 1 (risque le plus faible) à 7 (risque le plus élevé)
          </p>
          {distributorName && (
            <p className="text-xs text-gray-600 text-center italic">
              Niveau de risque établi par le distributeur {distributorName}
            </p>
          )}
        </div>
      </div>

      {/* Message général sur le risque du type de produit */}
      <div className={`p-4 rounded-lg border ${generalRisk.bgColor} ${generalRisk.borderColor}`}>
        <div className="flex items-start gap-3">
          <IconComponent className={`w-5 h-5 ${generalRisk.iconColor} mt-0.5 flex-shrink-0`} />
          <div>
            <p className="font-semibold text-gray-900 mb-1">{generalRisk.title}</p>
            <p className="text-sm text-gray-700">{generalRisk.description}</p>
          </div>
        </div>
      </div>

      {/* Spécificité du produit avec volatilité historique */}
      {historicalPerformance && historicalPerformance.maxDrawdown && (
        <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
          <div className="flex items-start gap-3">
            <TrendingDown className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-gray-900 mb-1">Volatilité historique</p>
              <p className="text-sm text-gray-700">
                Ce produit a connu une baisse maximale de <span className="font-semibold">{Math.abs(historicalPerformance.maxDrawdown).toFixed(1)}%</span> sur 
                la période historique. Cela illustre le niveau de volatilité auquel vous pouvez vous attendre.
              </p>
              <p className="text-sm text-gray-600 mt-2">
                Un indicateur de risque de <span className="font-semibold">{risk.riskIndicator}/7</span> signifie 
                que ce produit est {risk.riskIndicator <= 3 ? "moins volatil" : risk.riskIndicator <= 5 ? "modérément volatil" : "fortement volatil"} comparé 
                à d'autres produits financiers.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Durée de détention recommandée */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold text-gray-900 mb-1">Durée de détention recommandée</p>
            <p className="text-sm text-gray-700">
              {risk.recommendedHoldingPeriodYears} an{risk.recommendedHoldingPeriodYears > 1 ? "s" : ""}
              {" - "}
              Pour maximiser vos chances de performance et lisser la volatilité, il est recommandé 
              de conserver ce produit sur cette durée minimale.
            </p>
          </div>
        </div>
      </div>

      {/* Possibilité de perte supérieure à l'investissement */}
      {!risk.canLoseMoreThanInvested && (
        <div className="pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            ✓ Vous ne pouvez pas perdre plus que votre investissement initial.
          </p>
        </div>
      )}
    </div>
  );
}
