"use client";

import { Card } from "@/components/ui/card";
import { HistoricalPerformance } from "@/types/financial-product";
import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Area, ComposedChart } from "recharts";

interface HistoricalChartProps {
  data: HistoricalPerformance;
}

type TimeRange = "1Y" | "3Y" | "5Y" | "MAX";

export function HistoricalChart({ data }: HistoricalChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>("5Y");
  
  // Filtrer les données selon la période sélectionnée
  const getFilteredData = () => {
    const now = new Date();
    const cutoffDate = new Date();
    
    switch (timeRange) {
      case "1Y":
        cutoffDate.setFullYear(now.getFullYear() - 1);
        break;
      case "3Y":
        cutoffDate.setFullYear(now.getFullYear() - 3);
        break;
      case "5Y":
        cutoffDate.setFullYear(now.getFullYear() - 5);
        break;
      case "MAX":
      default:
        return data.dataPoints;
    }
    
    return data.dataPoints.filter(point => new Date(point.date) >= cutoffDate);
  };
  
  const chartData = getFilteredData();
  const currentPoint = chartData[chartData.length - 1];
  const startPoint = chartData[0];
  const performance = ((currentPoint.value - startPoint.value) / startPoint.value) * 100;
  
  // Calculer le drawdown maximum sur la période
  let maxValue = startPoint.value;
  let maxDrawdown = 0;
  
  chartData.forEach(point => {
    if (point.value > maxValue) {
      maxValue = point.value;
    }
    const drawdown = ((point.value - maxValue) / maxValue) * 100;
    if (drawdown < maxDrawdown) {
      maxDrawdown = drawdown;
    }
  });
  
  const timeRanges: TimeRange[] = ["1Y", "3Y", "5Y", "MAX"];
  
  return (
    <Card className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">
              Dans le passé
            </h2>
            <p className="text-sm text-gray-500">
              Performance historique (base 100 au {new Date(startPoint.date).toLocaleDateString("fr-FR")})
            </p>
          </div>
          
          <div className="flex gap-2">
            {timeRanges.map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  timeRange === range
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
        
        {/* Point "Aujourd'hui" mis en avant */}
        <div className="flex items-center gap-6 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse" />
            <div>
              <div className="text-sm text-gray-500">Aujourd'hui</div>
              <div className="text-2xl font-bold text-blue-600">
                {currentPoint.value.toFixed(1)}
              </div>
            </div>
          </div>
          
          <div>
            <div className="text-sm text-gray-500">Performance</div>
            <div className={`text-xl font-bold ${performance >= 0 ? "text-green-600" : "text-red-600"}`}>
              {performance >= 0 ? "+" : ""}{performance.toFixed(2)}%
            </div>
          </div>
          
          {data.annualizedReturn && (
            <div>
              <div className="text-sm text-gray-500">Rendement annualisé</div>
              <div className="text-xl font-semibold text-gray-700">
                {data.annualizedReturn.toFixed(2)}%
              </div>
            </div>
          )}
          
          <div>
            <div className="text-sm text-gray-500">Drawdown max</div>
            <div className="text-xl font-semibold text-red-600">
              {maxDrawdown.toFixed(2)}%
            </div>
          </div>
        </div>
      </div>
      
      {/* Graphique */}
      <div className="w-full h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            
            <XAxis
              dataKey="date"
              tickFormatter={(value: string) => {
                const date = new Date(value);
                return date.toLocaleDateString("fr-FR", { month: "short", year: "2-digit" });
              }}
              stroke="#9CA3AF"
              style={{ fontSize: "12px" }}
            />
            
            <YAxis
              stroke="#9CA3AF"
              style={{ fontSize: "12px" }}
              tickFormatter={(value: number) => `${value}`}
            />
            
            <Tooltip
              contentStyle={{
                backgroundColor: "#FFF",
                border: "1px solid #E5E7EB",
                borderRadius: "8px",
                padding: "12px",
              }}
              formatter={(value: number) => [`${value.toFixed(2)}`, "Valeur"]}
              labelFormatter={(label: string) => new Date(label).toLocaleDateString("fr-FR")}
            />
            
            {/* Ligne de référence à 100 */}
            <ReferenceLine y={100} stroke="#9CA3AF" strokeDasharray="3 3" />
            
            {/* Zone sous la courbe */}
            <Area
              type="monotone"
              dataKey="value"
              stroke="none"
              fillOpacity={1}
              fill="url(#colorValue)"
            />
            
            {/* Ligne de performance */}
            <Line
              type="monotone"
              dataKey="value"
              stroke="#3B82F6"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6, fill: "#3B82F6" }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      
      {/* Zone futur (grisée) */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg border-l-4 border-gray-300">
        <div className="flex items-center gap-2">
          <div className="w-16 h-1 bg-gradient-to-r from-gray-300 to-transparent" />
          <span className="text-sm text-gray-600 font-medium">Zone future (performances futures incertaines)</span>
        </div>
      </div>
      
      {/* Disclaimer légal */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-xs text-yellow-900 font-medium">
          ⚠️ Les performances passées ne préjugent pas des performances futures.
        </p>
      </div>
    </Card>
  );
}
