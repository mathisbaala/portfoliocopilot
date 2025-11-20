"use client";

import { Card } from "@/components/ui/card";
import { PerformanceScenarios, formatCurrency, calculatePerformance } from "@/types/financial-product";
import { TrendingDown, TrendingUp, Minus, AlertTriangle } from "lucide-react";

interface PerformanceScenariosProps {
  scenarios: PerformanceScenarios;
}

export function PerformanceScenariosCard({ scenarios }: PerformanceScenariosProps) {
  const getScenarioIcon = (type: string) => {
    switch (type) {
      case "stress":
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case "unfavourable":
        return <TrendingDown className="w-5 h-5 text-orange-600" />;
      case "moderate":
        return <Minus className="w-5 h-5 text-blue-600" />;
      case "favourable":
        return <TrendingUp className="w-5 h-5 text-green-600" />;
      default:
        return null;
    }
  };
  
  const getScenarioColor = (type: string) => {
    switch (type) {
      case "stress":
        return "bg-red-50 border-red-200 text-red-900";
      case "unfavourable":
        return "bg-orange-50 border-orange-200 text-orange-900";
      case "moderate":
        return "bg-blue-50 border-blue-200 text-blue-900";
      case "favourable":
        return "bg-green-50 border-green-200 text-green-900";
      default:
        return "bg-gray-50 border-gray-200 text-gray-900";
    }
  };
  
  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Scénarios de performance
        </h2>
        <p className="text-sm text-gray-600">
          Estimations sur la base d'un investissement de {formatCurrency(scenarios.baseInvestmentAmount, scenarios.baseCurrency)}
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {scenarios.scenarios.map((scenario) => {
          const performance = calculatePerformance(
            scenario.amountAfterEndOfRecommendedPeriod,
            scenarios.baseInvestmentAmount
          );
          
          return (
            <div
              key={scenario.type}
              className={`p-4 rounded-lg border-2 ${getScenarioColor(scenario.type)}`}
            >
              <div className="flex items-center gap-2 mb-3">
                {getScenarioIcon(scenario.type)}
                <h3 className="font-semibold text-sm">{scenario.label}</h3>
              </div>
              
              <div className="space-y-2">
                <div>
                  <div className="text-xs opacity-70 mb-1">Montant final</div>
                  <div className="text-xl font-bold">
                    {formatCurrency(scenario.amountAfterEndOfRecommendedPeriod, scenarios.baseCurrency)}
                  </div>
                </div>
                
                <div>
                  <div className="text-xs opacity-70 mb-1">Performance</div>
                  <div className={`text-lg font-semibold ${performance >= 0 ? "text-green-700" : "text-red-700"}`}>
                    {performance >= 0 ? "+" : ""}{performance.toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <p className="text-xs text-gray-600">
          <strong>Note:</strong> Ces scénarios sont des exemples et ne constituent pas une garantie de performance.
          Les résultats réels peuvent varier considérablement.
        </p>
      </div>
    </Card>
  );
}
