"use client";

import { Product, TypeSpecific } from "@/types/financial-product";
import { Badge } from "@/components/ui/badge";
import { Building2, Hash, Landmark } from "lucide-react";

interface InvestmentSectionProps {
  product?: Product;
  typeSpecific?: TypeSpecific;
}

/**
 * Section 1 : Dans quoi j'investis ?
 * Contient la composition et l'objectif du produit financier
 */
export function InvestmentSection({ product, typeSpecific }: InvestmentSectionProps) {
  // Placeholder si les données ne sont pas fournies
  if (!product || !typeSpecific) {
    return (
      <div className="p-8 bg-slate-50 rounded-xl border-2 border-dashed border-slate-300">
        <p className="text-center text-slate-600 text-sm">
          📋 Données du produit manquantes
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Nom du produit */}
      <div>
        <h3 className="text-3xl font-bold text-gray-900 mb-2">
          {product.name}
        </h3>
        <p className="text-lg text-gray-600">{product.descriptionShort}</p>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-2">
        <Badge variant="secondary" className="text-sm">
          {typeSpecific.kind}
        </Badge>
        <Badge variant="outline" className="text-sm">
          {typeSpecific.category}
        </Badge>
        {typeSpecific.managementStyle && (
          <Badge variant="outline" className="text-sm">
            {typeSpecific.managementStyle === "PASSIVE" ? "Gestion passive" : "Gestion active"}
          </Badge>
        )}
        {typeSpecific.peaEligible && (
          <Badge variant="default" className="text-sm bg-green-600 hover:bg-green-700">
            Éligible PEA
          </Badge>
        )}
      </div>

      {/* Informations clés en grille */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Building2 className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Émetteur</p>
            <p className="font-semibold text-gray-900">{product.manufacturer}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Hash className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Code ISIN</p>
            <p className="font-semibold text-gray-900 font-mono text-sm">{product.isin}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Landmark className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Régulateur</p>
            <p className="font-semibold text-gray-900">{product.regulator}</p>
          </div>
        </div>
      </div>

      {/* Index suivi (pour ETF) */}
      {typeSpecific.index && (
        <div className="pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-1">Indice répliqué</p>
          <p className="font-semibold text-gray-900">{typeSpecific.index.name}</p>
          <p className="text-sm text-gray-600 mt-1">
            Fournisseur : {typeSpecific.index.provider}
          </p>
        </div>
      )}
    </div>
  );
}
