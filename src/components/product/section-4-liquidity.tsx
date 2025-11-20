"use client";

import { LiquidityAndTrading, TypeSpecific } from "@/types/financial-product";
import { Check, Clock, Lock, Unlock } from "lucide-react";

interface Section4LiquidityProps {
  liquidityAndTrading: LiquidityAndTrading;
  typeSpecific: TypeSpecific;
}

export function Section4Liquidity({ liquidityAndTrading, typeSpecific }: Section4LiquidityProps) {
  // Informations sur la liquidité selon le type de produit
  const isHighlyLiquid = liquidityAndTrading.tradedOnExchange && typeSpecific.kind === "ETF";

  return (
    <div className="space-y-6">
      {/* Liquidité générale du produit */}
      <div className={`p-4 rounded-lg border ${isHighlyLiquid ? "bg-green-50 border-green-200" : "bg-yellow-50 border-yellow-200"}`}>
        <div className="flex items-start gap-3">
          {isHighlyLiquid ? (
            <Unlock className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
          ) : (
            <Clock className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
          )}
          <div>
            <p className="font-semibold text-gray-900 mb-1">
              {isHighlyLiquid ? "Très liquide" : "Liquidité variable"}
            </p>
            <p className="text-sm text-gray-700">
              {isHighlyLiquid 
                ? "Les ETF sont cotés en continu pendant les heures d'ouverture de la bourse. Vous pouvez acheter ou vendre à tout moment pendant les séances de cotation."
                : "Ce produit peut être racheté selon les modalités définies par l'émetteur. Consultez le prospectus pour les conditions exactes."}
            </p>
          </div>
        </div>
      </div>

      {/* Informations de cotation (si applicable) */}
      {liquidityAndTrading.tradedOnExchange && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-500 mb-1">Place de cotation</p>
            <p className="font-semibold text-gray-900">{liquidityAndTrading.mainExchange}</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-500 mb-1">Ticker</p>
            <p className="font-semibold text-gray-900 font-mono">{liquidityAndTrading.ticker}</p>
          </div>
        </div>
      )}

      {/* Selon l'enveloppe fiscale */}
      <div>
        <h4 className="font-semibold text-gray-900 mb-3">Liquidité selon votre enveloppe</h4>
        
        <div className="space-y-3">
          {/* Compte-titres */}
          <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200">
            <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-medium text-gray-900">Compte-titres ordinaire (CTO)</p>
              <p className="text-sm text-gray-600 mt-1">
                Aucune contrainte : vous pouvez acheter et vendre à tout moment, et retirer vos fonds quand vous le souhaitez.
              </p>
            </div>
          </div>

          {/* PEA */}
          {typeSpecific.peaEligible && (
            <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200">
              <Lock className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-medium text-gray-900">Plan d'Épargne en Actions (PEA)</p>
                <p className="text-sm text-gray-600 mt-1">
                  Vous pouvez acheter/vendre librement dans votre PEA, mais <span className="font-semibold">les retraits avant 5 ans entraînent la clôture du plan</span> et 
                  la perte des avantages fiscaux.
                </p>
              </div>
            </div>
          )}

          {/* Assurance-vie */}
          <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200">
            <Clock className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-medium text-gray-900">Assurance-vie</p>
              <p className="text-sm text-gray-600 mt-1">
                Vous pouvez effectuer des arbitrages entre supports, mais <span className="font-semibold">les retraits avant 8 ans sont fiscalement moins avantageux</span>. 
                L'assurance-vie est optimale sur le long terme.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Note sur les frais de courtage */}
      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm text-gray-700">
          <span className="font-semibold">💡 Bon à savoir :</span> Même si le produit est liquide, 
          votre courtier peut appliquer des frais de transaction à chaque achat ou vente. 
          Vérifiez la grille tarifaire de votre établissement.
        </p>
      </div>
    </div>
  );
}
