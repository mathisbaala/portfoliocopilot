"use client";

import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: "up" | "down" | "neutral";
  color?: "blue" | "green" | "red" | "gray";
}

export function KpiCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = "blue",
}: KpiCardProps) {
  const colorClasses = {
    blue: "text-blue-600 bg-blue-50",
    green: "text-green-600 bg-green-50",
    red: "text-red-600 bg-red-50",
    gray: "text-gray-600 bg-gray-50",
  };

  const trendIcons = {
    up: "↗",
    down: "↘",
    neutral: "→",
  };

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="text-sm font-medium text-gray-600">{title}</div>
        {Icon && (
          <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      
      <div className="space-y-2">
        <div className={`text-2xl font-bold ${colorClasses[color].split(" ")[0]}`}>
          {value}
        </div>
        
        {subtitle && (
          <div className="flex items-center gap-2">
            {trend && (
              <span className="text-xs">{trendIcons[trend]}</span>
            )}
            <span className="text-sm text-gray-500">{subtitle}</span>
          </div>
        )}
      </div>
    </Card>
  );
}
