"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Upload, FileText, Target, Percent, AlertTriangle, Download, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { getStoredExtractions, getExtractionStats, deleteExtraction, clearAllExtractions, type StoredExtraction } from "@/lib/storage";
import { toast } from "sonner";

export default function DashboardPage() {
  const [extractions, setExtractions] = useState<StoredExtraction[]>(() => getStoredExtractions());
  const [stats, setStats] = useState(() => getExtractionStats());

  const loadData = () => {
    const stored = getStoredExtractions();
    const calculatedStats = getExtractionStats();
    setExtractions(stored);
    setStats(calculatedStats);
  };

  const handleDelete = (id: string, fileName: string) => {
    deleteExtraction(id);
    toast.success(`${fileName} supprimé`);
    loadData();
  };

  const handleClearAll = () => {
    if (confirm("Êtes-vous sûr de vouloir supprimer tous les documents ?")) {
      clearAllExtractions();
      toast.success("Tous les documents ont été supprimés");
      loadData();
    }
  };

  const downloadJSON = (extraction: StoredExtraction) => {
    const blob = new Blob([JSON.stringify(extraction.data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${extraction.fileName.replace(".pdf", "")}_data.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-10 max-w-7xl mx-auto">
      <div className="space-y-3">
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
          Dashboard
        </h1>
        <p className="text-lg text-slate-600">
          Vue d&apos;ensemble de vos analyses de documents financiers
        </p>
      </div>

      {/* Statistics Cards */}
      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0 }}
        >
          <Card className="hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold text-slate-700">Documents analysés</CardTitle>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md">
                  <FileText className="w-5 h-5 text-white" />
                </div>
              </div>
            </CardHeader>
            <Separator />
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-slate-900">{stats.totalDocuments}</div>
              <p className="text-sm text-slate-500 mt-2">
                {stats.totalDocuments === 0 ? "Aucun document" : "Total analysés"}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold text-slate-700">Confiance moyenne</CardTitle>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-md">
                  <Target className="w-5 h-5 text-white" />
                </div>
              </div>
            </CardHeader>
            <Separator />
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-slate-900">
                {stats.totalDocuments > 0 ? `${(stats.avgConfidence * 100).toFixed(0)}%` : "—"}
              </div>
              <p className="text-sm text-slate-500 mt-2">
                Qualité des extractions
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold text-slate-700">Risque moyen</CardTitle>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-md">
                  <AlertTriangle className="w-5 h-5 text-white" />
                </div>
              </div>
            </CardHeader>
            <Separator />
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-slate-900">
                {stats.totalDocuments > 0 ? `${stats.avgRisk.toFixed(1)}/7` : "—"}
              </div>
              <p className="text-sm text-slate-500 mt-2">
                Indicateur SRI
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card className="hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold text-slate-700">Frais moyens</CardTitle>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-md">
                  <Percent className="w-5 h-5 text-white" />
                </div>
              </div>
            </CardHeader>
            <Separator />
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-slate-900">
                {stats.totalDocuments > 0 ? `${stats.avgFees.toFixed(2)}%` : "—"}
              </div>
              <p className="text-sm text-slate-500 mt-2">
                Gestion annuelle
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </section>

      {/* Quick Action */}
      {extractions.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          <Card className="border-2 border-dashed border-blue-300 bg-gradient-to-br from-blue-50 to-white">
            <CardContent className="py-12">
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center">
                  <Upload className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">
                    Commencez votre première analyse
                  </h3>
                  <p className="text-slate-600">
                    Uploadez un document financier (DIC/DICI) pour extraire automatiquement les données
                  </p>
                </div>
                <Link href="/dashboard/upload">
                  <Button size="lg" className="mt-4">
                    <Upload className="w-5 h-5 mr-2" />
                    Uploader un document
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Recent Extractions */}
      {extractions.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900">
              Documents récents ({extractions.length})
            </h2>
            <div className="flex gap-2">
              <Link href="/dashboard/upload">
                <Button variant="default">
                  <Upload className="w-4 h-4 mr-2" />
                  Nouveau document
                </Button>
              </Link>
              <Button variant="outline" onClick={handleClearAll}>
                <Trash2 className="w-4 h-4 mr-2" />
                Tout supprimer
              </Button>
            </div>
          </div>

          <div className="grid gap-4">
            {extractions.slice(0, 10).map((extraction, index) => (
              <motion.div
                key={extraction.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <FileText className="w-5 h-5 text-blue-600" />
                          <h3 className="font-semibold text-slate-900">{extraction.fileName}</h3>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          <div className="bg-slate-50 px-3 py-2 rounded-lg">
                            <div className="text-slate-500 text-xs">Émetteur</div>
                            <div className="font-semibold text-slate-900 truncate">
                              {extraction.data.general?.emetteur || "N/A"}
                            </div>
                          </div>
                          <div className="bg-slate-50 px-3 py-2 rounded-lg">
                            <div className="text-slate-500 text-xs">Risque</div>
                            <div className="font-semibold text-slate-900">
                              {extraction.data.risque?.niveau || "N/A"}/7
                            </div>
                          </div>
                          <div className="bg-slate-50 px-3 py-2 rounded-lg">
                            <div className="text-slate-500 text-xs">Frais</div>
                            <div className="font-semibold text-slate-900">
                              {extraction.data.frais?.gestionAnnuels ?? "N/A"}%
                            </div>
                          </div>
                          <div className="bg-slate-50 px-3 py-2 rounded-lg">
                            <div className="text-slate-500 text-xs">Confiance</div>
                            <div className="font-semibold text-slate-900">
                              {((extraction.data.extraction?.confidence || 0) * 100).toFixed(0)}%
                            </div>
                          </div>
                        </div>
                        <p className="text-xs text-slate-500 mt-3">
                          Analysé le {new Date(extraction.uploadDate).toLocaleString("fr-FR")}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadJSON(extraction)}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(extraction.id, extraction.fileName)}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
