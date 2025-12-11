"use client";

import { Costs } from "@/types/financial-product";
import { formatPercent } from "@/types/financial-product";
import { Wallet, TrendingDown, ArrowRightLeft, AlertCircle } from "lucide-react";

interface FeesSectionProps {
  costs?: Costs;
  productType?: string;
}

/**
 * Section 5 : Combien ça me coûte ?
 * Détaille la structure complète des frais
 */
export function FeesSection({ costs, productType = "ETF" }: FeesSectionProps) {
  // Placeholder si les données ne sont pas fournies
  if (!costs) {
    return (
      <div className="p-8 bg-slate-50 rounded-xl border-2 border-dashed border-slate-300">
        <p className="text-center text-slate-600 text-sm">
          📋 Données de coûts manquantes
        </p>
      </div>
    );
  }

  // Calcul du coût total annuel
  const totalAnnualCost = costs.ongoingChargesPercentPerYear + costs.transactionCostsPercentPerYear;
  
  // Évaluation du niveau de frais
  const getCostLevel = () => {
    if (totalAnnualCost < 0.5) return { label: "Très faibles", color: "text-green-600" };
    if (totalAnnualCost < 1) return { label: "Faibles", color: "text-green-600" };
    if (totalAnnualCost < 2) return { label: "Modérés", color: "text-yellow-600" };
    return { label: "Élevés", color: "text-red-600" };
  };

  const costLevel = getCostLevel();

  return (
    <div className="space-y-6">
      {/* Vue d'ensemble des frais */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900">Frais totaux annuels</h3>
          <span className={`text-2xl font-bold ${costLevel.color}`}>
            {formatPercent(totalAnnualCost)}
          </span>
        </div>
        <p className="text-sm text-gray-600">
          Niveau de frais : <span className={`font-semibold ${costLevel.color}`}>{costLevel.label}</span>
        </p>
      </div>

      {/* Détail des frais du produit */}
      <div>
        <h4 className="font-semibold text-gray-900 mb-3">Frais liés au produit</h4>
        
        <div className="space-y-3">
          {/* Frais de gestion */}
          <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200">
            <Wallet className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <p className="font-medium text-gray-900">Frais de gestion courants</p>
                <span className="font-semibold text-gray-900">
                  {formatPercent(costs.ongoingChargesPercentPerYear)} / an
                </span>
              </div>
              <p className="text-sm text-gray-600">
                Frais prélevés automatiquement pour la gestion du fonds. 
                {productType === "ETF" && " Les ETF ont généralement des frais très compétitifs."}
              </p>
            </div>
          </div>

          {/* Frais de transaction */}
          {costs.transactionCostsPercentPerYear > 0 && (
            <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200">
              <ArrowRightLeft className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-medium text-gray-900">Coûts de transaction</p>
                  <span className="font-semibold text-gray-900">
                    {formatPercent(costs.transactionCostsPercentPerYear)} / an
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  Frais liés aux achats et ventes de titres effectués par le gestionnaire du fonds.
                </p>
              </div>
            </div>
          )}

          {/* Frais d'entrée/sortie */}
          {(costs.entryFeePercent > 0 || costs.exitFeePercent > 0) && (
            <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200">
              <TrendingDown className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-medium text-gray-900 mb-2">Frais d'entrée / sortie</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-600">Entrée : </span>
                    <span className="font-semibold">{formatPercent(costs.entryFeePercent)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Sortie : </span>
                    <span className="font-semibold">{formatPercent(costs.exitFeePercent)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Avertissement sur les frais d'enveloppe */}
      <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold text-gray-900 mb-1">Les frais peuvent s'additionner</p>
            <p className="text-sm text-gray-700 mb-2">
              Aux frais du produit s'ajoutent potentiellement :
            </p>
            <ul className="text-sm text-gray-700 space-y-1 ml-4">
              <li>• <span className="font-medium">Frais de courtage</span> : facturés par votre courtier à chaque transaction</li>
              <li>• <span className="font-medium">Frais d'enveloppe</span> : si vous détenez ce produit en assurance-vie ou PEA (généralement 0,5% à 1% par an)</li>
              <li>• <span className="font-medium">Droits de garde</span> : certains établissements facturent des frais de tenue de compte</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Exemple concret */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <p className="font-semibold text-gray-900 mb-2">💡 Exemple sur 10 000 €</p>
        <p className="text-sm text-gray-700">
          Avec des frais totaux de <span className="font-semibold">{formatPercent(totalAnnualCost)}</span>, 
          vous paierez environ <span className="font-semibold">{((costs.baseInvestmentAmount * totalAnnualCost) / 100).toFixed(0)} €</span> par an 
          (sur un investissement initial de {costs.baseInvestmentAmount.toLocaleString('fr-FR')} €).
        </p>
        <p className="text-xs text-gray-600 mt-2">
          Note : Ce calcul est indicatif et ne tient pas compte des frais de courtage et d'enveloppe.
        </p>
      </div>
    </div>
  );
}
