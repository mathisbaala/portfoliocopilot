"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Risk, Costs, LiquidityAndTrading, TypeSpecific } from "@/types/financial-product";
import { KpiCard } from "./kpi-card";
import { Activity, TrendingUp, DollarSign, Calendar } from "lucide-react";

interface KpiGridProps {
  risk: Risk;
  costs: Costs;
  trading: LiquidityAndTrading;
  typeSpecific: TypeSpecific;
}

export function KpiGrid({ risk, costs, trading, typeSpecific }: KpiGridProps) {
  const totalCosts = costs.ongoingChargesPercentPerYear + costs.transactionCostsPercentPerYear;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <KpiCard
        title="Indicateur de risque"
        value={`${risk.riskIndicator}/7`}
        subtitle={`Période recommandée: ${risk.recommendedHoldingPeriodYears} ans`}
        icon={Activity}
        color={risk.riskIndicator > 5 ? "red" : risk.riskIndicator > 3 ? "blue" : "green"}
      />
      
      <KpiCard
        title="Frais totaux annuels"
        value={`${totalCosts.toFixed(2)}%`}
        subtitle={`Frais courants: ${costs.ongoingChargesPercentPerYear}%`}
        icon={DollarSign}
        color="gray"
      />
      
      <KpiCard
        title="Bourse"
        value={trading.ticker}
        subtitle={trading.mainExchange}
        icon={TrendingUp}
        color="blue"
      />
      
      <KpiCard
        title="Type de gestion"
        value={typeSpecific.managementStyle === "PASSIVE" ? "Passive" : "Active"}
        subtitle={typeSpecific.replicationMethod || "N/A"}
        icon={Calendar}
        color="blue"
      />
    </div>
  );
}
