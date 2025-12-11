"use client";

import { LiquidityAndTrading, TypeSpecific } from "@/types/financial-product";
import { Check, Clock, Lock, ArrowRight, Unlock, AlertCircle } from "lucide-react";

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
                ? "Vous pouvez acheter ou vendre à tout moment. Les ETF sont cotés en continu pendant les heures d'ouverture de la bourse."
                : "Ce produit peut être racheté selon les modalités définies par l'émetteur. Consultez le prospectus pour les conditions exactes."}
            </p>
          </div>
        </div>
      </div>

      {/* Avertissement sur les enveloppes */}
      <div className="p-4 rounded-lg border bg-yellow-50 border-yellow-200">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm text-gray-700">
              <span className="font-semibold">Important :</span> Selon votre enveloppe (PEA, Assurance-vie, etc.), 
              il n'est pas toujours optimal de sortir avant une certaine période. Voir les détails ci-dessous.
            </p>
          </div>
        </div>
      </div>

      {/* Comment investir ? - Étapes */}
      <div>
        <h4 className="font-semibold text-gray-900 mb-4">Comment investir ?</h4>
        
        <div className="space-y-4">
          {/* Étape 1 : Choisir sa banque/plateforme */}
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                1
              </div>
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900 mb-1">Choisir sa banque ou plateforme d'investissement</p>
              <p className="text-sm text-gray-700">
                Sélectionnez un établissement bancaire traditionnel ou un courtier en ligne (ex: Boursorama, Degiro, Trade Republic, etc.). 
                Comparez les frais de transaction et de tenue de compte.
              </p>
            </div>
          </div>

          {/* Étape 2 : Choisir son enveloppe */}
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                2
              </div>
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900 mb-1">Choisir une enveloppe d'investissement</p>
              <p className="text-sm text-gray-700 mb-3">
                L'enveloppe détermine la liquidité, la fiscalité et les conditions de retrait de votre investissement.
              </p>
              
              {/* Liquidité selon l'enveloppe */}
              <div className="space-y-2">
                {/* Compte-titres */}
                <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Compte-titres ordinaire (CTO)</p>
                    <p className="text-xs text-gray-600 mt-0.5">
                      Aucune contrainte : vous pouvez acheter, vendre et retirer vos fonds à tout moment.
                    </p>
                  </div>
                </div>

                {/* PEA */}
                {typeSpecific.peaEligible && (
                  <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <Lock className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Plan d'Épargne en Actions (PEA)</p>
                      <p className="text-xs text-gray-600 mt-0.5">
                        Achat/vente libre, mais <span className="font-semibold">retrait avant 5 ans = clôture du plan</span> et perte des avantages fiscaux.
                      </p>
                    </div>
                  </div>
                )}

                {/* Assurance-vie */}
                <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <Clock className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Assurance-vie</p>
                    <p className="text-xs text-gray-600 mt-0.5">
                      Arbitrages possibles, mais <span className="font-semibold">retraits avant 8 ans fiscalement moins avantageux</span>.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Étape 3 : Passer l'ordre */}
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                3
              </div>
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900 mb-1">Passer votre ordre d'achat</p>
              <p className="text-sm text-gray-700">
                {liquidityAndTrading.tradedOnExchange ? (
                  <>
                    Ce produit est coté sur <span className="font-semibold">{liquidityAndTrading.mainExchange}</span> (ticker: <span className="font-mono font-semibold">{liquidityAndTrading.ticker}</span>). 
                    Vous pouvez acheter pendant les heures d'ouverture de la bourse.
                  </>
                ) : (
                  "Contactez votre établissement pour connaître les modalités de souscription."
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Note sur les frais */}
      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-start gap-2">
          <ArrowRight className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm text-gray-700">
              <span className="font-semibold">Attention aux frais :</span> Des frais d'entrée peuvent s'appliquer selon votre banque/courtier et l'enveloppe choisie. 
              Consultez la section <span className="font-semibold">"Combien ça me coûte ?"</span> pour plus de détails sur tous les frais.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
