"use client";

import { Product, Risk } from "@/types/financial-product";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

interface ProductHeaderProps {
  product: Product;
  risk: Risk;
}

export function ProductHeader({ product, risk }: ProductHeaderProps) {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Vous pouvez ajouter un toast de confirmation ici
  };

  return (
    <div className="mb-8">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {product.name}
          </h1>
          <p className="text-gray-600 mb-4">{product.descriptionShort}</p>
          
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">ISIN:</span>
              <button
                onClick={() => copyToClipboard(product.isin)}
                className="text-sm font-mono bg-gray-100 px-3 py-1 rounded hover:bg-gray-200 transition-colors"
                title="Cliquer pour copier"
              >
                {product.isin}
              </button>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Ticker:</span>
              <span className="text-sm font-mono bg-gray-100 px-3 py-1 rounded">
                {product.currency}
              </span>
            </div>
            
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              Risque {risk.riskIndicator}/7
            </Badge>
          </div>
        </div>
        
        <Card className="p-4 min-w-[200px]">
          <div className="text-sm text-gray-500 mb-1">Géré par</div>
          <div className="font-semibold text-gray-900">
            {product.manufacturer}
          </div>
          <div className="text-xs text-gray-400 mt-2">
            Régulateur: {product.regulator}
          </div>
        </Card>
      </div>
    </div>
  );
}
