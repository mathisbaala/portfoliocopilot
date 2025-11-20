"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";

interface QuestionSectionProps {
  question: string;
  children: React.ReactNode;
  onMoreDetails?: () => void;
}

export function QuestionSection({ question, children, onMoreDetails }: QuestionSectionProps) {
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">{question}</h2>
      <Card className="p-6 bg-white">
        {children}
        {onMoreDetails && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <Button 
              variant="outline" 
              onClick={onMoreDetails}
              className="w-full sm:w-auto flex items-center justify-center gap-2"
            >
              Plus de détails
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
