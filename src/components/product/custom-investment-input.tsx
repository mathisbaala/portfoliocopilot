"use client";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { formatCurrency } from "@/types/financial-product";

interface CustomInvestmentInputProps {
  baseCurrency?: string;
  defaultAmount?: number;
  onAmountChange?: (amount: number) => void;
}

export function CustomInvestmentInput({
  baseCurrency = "EUR",
  defaultAmount = 10000,
  onAmountChange,
}: CustomInvestmentInputProps) {
  const [amount, setAmount] = useState<number>(defaultAmount);
  
  const handleAmountChange = (value: string) => {
    const numValue = parseFloat(value.replace(/[^0-9.]/g, ""));
    if (!isNaN(numValue)) {
      setAmount(numValue);
      onAmountChange?.(numValue);
    }
  };
  
  return (
    <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
      <div className="max-w-md mx-auto">
        <Label htmlFor="investment-amount" className="text-lg font-semibold text-gray-900 mb-4 block">
          Simulez votre investissement
        </Label>
        
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-lg">
                {baseCurrency === "EUR" ? "€" : baseCurrency}
              </span>
              <Input
                id="investment-amount"
                type="text"
                value={amount.toLocaleString("fr-FR")}
                onChange={(e) => handleAmountChange(e.target.value)}
                className="pl-8 text-2xl font-bold h-14 text-center bg-white"
                placeholder="10 000"
              />
            </div>
            <p className="text-xs text-gray-600 mt-2 text-center">
              Montant que vous souhaitez investir
            </p>
          </div>
        </div>
        
        <div className="mt-6 grid grid-cols-3 gap-2">
          {[1000, 5000, 10000, 25000, 50000, 100000].map((preset) => (
            <button
              key={preset}
              onClick={() => {
                setAmount(preset);
                onAmountChange?.(preset);
              }}
              className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                amount === preset
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              {formatCurrency(preset, baseCurrency)}
            </button>
          ))}
        </div>
      </div>
    </Card>
  );
}
