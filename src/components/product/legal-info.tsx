"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Product, Risk, Costs, LiquidityAndTrading, TypeSpecific, DocumentInfo } from "@/types/financial-product";
import { useState } from "react";
import { ChevronDown, ChevronUp, Copy, FileText, Building, Shield, Calendar } from "lucide-react";

interface LegalInfoProps {
  product: Product;
  risk: Risk;
  costs: Costs;
  trading: LiquidityAndTrading;
  typeSpecific: TypeSpecific;
  documentInfo: DocumentInfo;
}

export function LegalInfo({
  product,
  risk,
  costs,
  trading,
  typeSpecific,
  documentInfo,
}: LegalInfoProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Vous pouvez ajouter un toast de confirmation ici
  };
  
  return (
    <Card className="mt-8">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors rounded-t-lg"
      >
        <div className="flex items-center gap-3">
          <FileText className="w-5 h-5 text-gray-600" />
          <h2 className="text-xl font-bold text-gray-900">
            Informations légales & documentation
          </h2>
        </div>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-gray-600" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-600" />
        )}
      </button>
      
      {isOpen && (
        <div className="p-6 pt-0 border-t">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {/* Identité */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-4 h-4 text-blue-600" />
                <h3 className="font-semibold text-gray-900">Identité du produit</h3>
              </div>
              
              <div>
                <div className="text-xs text-gray-500 mb-1">Nom officiel</div>
                <div className="text-sm font-medium text-gray-900">{product.name}</div>
              </div>
              
              <div>
                <div className="text-xs text-gray-500 mb-1">Code ISIN</div>
                <div className="flex items-center gap-2">
                  <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                    {product.isin}
                  </code>
                  <button
                    onClick={() => copyToClipboard(product.isin)}
                    className="p-1 hover:bg-gray-100 rounded"
                    title="Copier"
                  >
                    <Copy className="w-3 h-3 text-gray-600" />
                  </button>
                </div>
              </div>
              
              <div>
                <div className="text-xs text-gray-500 mb-1">Mnémonique boursier</div>
                <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                  {trading.ticker}
                </code>
              </div>
              
              <div>
                <div className="text-xs text-gray-500 mb-1">Devise de référence</div>
                <div className="text-sm font-medium text-gray-900">{product.currency}</div>
              </div>
            </div>
            
            {/* Acteur / cadre réglementaire */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <Building className="w-4 h-4 text-blue-600" />
                <h3 className="font-semibold text-gray-900">Cadre réglementaire</h3>
              </div>
              
              <div>
                <div className="text-xs text-gray-500 mb-1">Société de gestion</div>
                <div className="text-sm font-medium text-gray-900">{product.manufacturer}</div>
              </div>
              
              <div>
                <div className="text-xs text-gray-500 mb-1">Pays de droit</div>
                <div className="text-sm font-medium text-gray-900">{product.domicileCountry}</div>
              </div>
              
              <div>
                <div className="text-xs text-gray-500 mb-1">Autorité de tutelle</div>
                <div className="text-sm font-medium text-gray-900">{product.regulator}</div>
              </div>
              
              <div>
                <div className="text-xs text-gray-500 mb-1">Place de cotation principale</div>
                <div className="text-sm font-medium text-gray-900">{trading.mainExchange}</div>
              </div>
            </div>
            
            {/* Caractéristiques formelles */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-4 h-4 text-blue-600" />
                <h3 className="font-semibold text-gray-900">Caractéristiques</h3>
              </div>
              
              <div>
                <div className="text-xs text-gray-500 mb-1">Classification</div>
                <div className="flex flex-wrap gap-2 mt-1">
                  <Badge variant="outline">{typeSpecific.kind}</Badge>
                  {typeSpecific.fundType && (
                    <Badge variant="outline">{typeSpecific.fundType}</Badge>
                  )}
                  <Badge variant="outline">{typeSpecific.category}</Badge>
                </div>
              </div>
              
              {typeSpecific.index && (
                <div>
                  <div className="text-xs text-gray-500 mb-1">Indice de référence</div>
                  <div className="text-sm font-medium text-gray-900">
                    {typeSpecific.index.name}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    ({typeSpecific.index.provider})
                  </div>
                </div>
              )}
              
              <div>
                <div className="text-xs text-gray-500 mb-1">Éligibilité</div>
                <div className="flex flex-wrap gap-2 mt-1">
                  {typeSpecific.peaEligible && (
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                      Éligible PEA
                    </Badge>
                  )}
                  {trading.canRedeemBeforeEndOfPeriod && (
                    <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                      Rachat anticipé
                    </Badge>
                  )}
                </div>
              </div>
              
              <div>
                <div className="text-xs text-gray-500 mb-1">Politique de distribution</div>
                <div className="text-sm font-medium text-gray-900">
                  {typeSpecific.distributionPolicy === "ACCUMULATION" 
                    ? "Capitalisation" 
                    : "Distribution"}
                </div>
              </div>
            </div>
          </div>
          
          {/* Documentation */}
          <div className="mt-8 pt-6 border-t">
            <h3 className="font-semibold text-gray-900 mb-4">Documentation</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-500 mb-1">Type de document</div>
                <div className="text-sm font-medium text-gray-900 mb-2">
                  {documentInfo.documentType}
                </div>
                <div className="text-xs text-gray-500">
                  Mis à jour le {new Date(documentInfo.kidProductionDate).toLocaleDateString("fr-FR")}
                </div>
              </div>
              
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="text-sm font-medium text-blue-900 mb-2">
                  Documents disponibles
                </div>
                <div className="space-y-2">
                  <a
                    href="#"
                    className="text-sm text-blue-600 hover:text-blue-800 underline block"
                  >
                    📄 Document d&apos;informations clés (KID)
                  </a>
                  <a
                    href="#"
                    className="text-sm text-blue-600 hover:text-blue-800 underline block"
                  >
                    📋 Prospectus complet
                  </a>
                  <a
                    href="#"
                    className="text-sm text-blue-600 hover:text-blue-800 underline block"
                  >
                    📊 Rapports périodiques
                  </a>
                </div>
              </div>
            </div>
          </div>
          
          {/* Frais détaillés */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-3">Détail des frais</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-gray-500">Frais d'entrée</div>
                <div className="font-semibold">{costs.entryFeePercent}%</div>
              </div>
              <div>
                <div className="text-gray-500">Frais de sortie</div>
                <div className="font-semibold">{costs.exitFeePercent}%</div>
              </div>
              <div>
                <div className="text-gray-500">Frais courants</div>
                <div className="font-semibold">{costs.ongoingChargesPercentPerYear}%/an</div>
              </div>
              <div>
                <div className="text-gray-500">Coûts de transaction</div>
                <div className="font-semibold">{costs.transactionCostsPercentPerYear}%/an</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
