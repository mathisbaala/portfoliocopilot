"use client";

import { useState } from "react";
import { JohnsonData } from "@/types/johnson";
import { DICData } from "@/types/dic-data";

export default function ComparisonPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [fileUrl, setFileUrl] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");
  const [dicResult, setDicResult] = useState<DICData | null>(null);
  const [johnsonResult, setJohnsonResult] = useState<JohnsonData | null>(null);
  const [error, setError] = useState<string>("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type === "application/pdf") {
        setFile(selectedFile);
        setError("");
        setDicResult(null);
        setJohnsonResult(null);
      } else {
        setError("⚠️ Seulement les fichiers PDF sont acceptés");
        setFile(null);
      }
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError("");
    setDicResult(null);
    setJohnsonResult(null);

    try {
      // 1. Upload
      const formData = new FormData();
      formData.append("file", file);

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) {
        const errorData = await uploadRes.json();
        throw new Error(errorData.error || "Erreur upload");
      }

      const uploadData = await uploadRes.json();
      setFileUrl(uploadData.fileUrl);
      setFileName(uploadData.fileName);

      console.log("✅ Upload réussi:", uploadData);

      // 2. Extraction parallèle (DIC + Johnson)
      setExtracting(true);
      
      const [dicRes, johnsonRes] = await Promise.all([
        fetch("/api/extract", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileUrl: uploadData.fileUrl,
            fileName: uploadData.fileName,
          }),
        }),
        fetch("/api/extract-johnson", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileUrl: uploadData.fileUrl,
            fileName: uploadData.fileName,
          }),
        }),
      ]);

      const dicData = await dicRes.json();
      const johnsonData = await johnsonRes.json();

      setDicResult(dicData);
      setJohnsonResult(johnsonData);

      console.log("✅ DIC:", dicData);
      console.log("✅ Johnson:", johnsonData);

    } catch (err: any) {
      setError(err.message);
      console.error("❌ Erreur:", err);
    } finally {
      setUploading(false);
      setExtracting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            🔬 Comparaison DIC vs Johnson
          </h1>
          <p className="text-gray-300">
            Teste les deux formats d'extraction en parallèle
          </p>
        </div>

        {/* Upload Section */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 mb-8 border border-white/20">
          <div className="flex flex-col items-center gap-4">
            <label className="w-full max-w-md">
              <div className="flex items-center justify-center w-full h-32 border-2 border-dashed border-white/30 rounded-xl cursor-pointer hover:border-white/50 transition-colors bg-white/5">
                <div className="text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-white/70 mb-2"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <p className="text-white/90 font-medium">
                    {file ? file.name : "Choisir un PDF"}
                  </p>
                  <p className="text-white/60 text-sm mt-1">
                    DIC, KID, Prospectus...
                  </p>
                </div>
              </div>
              <input
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>

            <button
              onClick={handleUpload}
              disabled={!file || uploading || extracting}
              className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-purple-500/50 transition-all"
            >
              {uploading
                ? "📤 Upload..."
                : extracting
                ? "🔍 Extraction en cours..."
                : "🚀 Analyser"}
            </button>

            {error && (
              <div className="w-full max-w-md p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200">
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Results Grid */}
        {(dicResult || johnsonResult) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* DIC Result */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white">
                  📊 Format DIC (Ancien)
                </h2>
                {dicResult && dicResult.extraction && (
                  <span className="px-3 py-1 bg-blue-500/30 text-blue-200 rounded-full text-sm">
                    Confiance: {(dicResult.extraction.confidence * 100).toFixed(0)}%
                  </span>
                )}
              </div>
              
              {dicResult ? (
                <div className="space-y-3">
                  <div className="bg-black/20 rounded-lg p-4">
                    <h3 className="text-white/70 text-sm mb-2">Confiance</h3>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-white/10 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full"
                          style={{ width: `${dicResult.extraction.confidence * 100}%` }}
                        />
                      </div>
                      <span className="text-white font-mono">
                        {(dicResult.extraction.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>

                  <div className="bg-black/20 rounded-lg p-4">
                    <h3 className="text-white/70 text-sm mb-2">Données extraites</h3>
                    <div className="space-y-1 text-sm">
                      <div className="text-white">
                        <span className="text-white/60">Émetteur:</span>{" "}
                        {dicResult.general.emetteur || "❌"}
                      </div>
                      <div className="text-white">
                        <span className="text-white/60">Produit:</span>{" "}
                        {dicResult.general.nomProduit || "❌"}
                      </div>
                      <div className="text-white">
                        <span className="text-white/60">ISIN:</span>{" "}
                        {dicResult.general.isin || "❌"}
                      </div>
                      <div className="text-white">
                        <span className="text-white/60">Risque:</span>{" "}
                        {dicResult.risque.niveau || "❌"}/7
                      </div>
                      <div className="text-white">
                        <span className="text-white/60">Frais gestion:</span>{" "}
                        {dicResult.frais.gestionAnnuels || "❌"}%
                      </div>
                    </div>
                  </div>

                  <details className="bg-black/20 rounded-lg p-4">
                    <summary className="text-white/70 cursor-pointer hover:text-white">
                      🔍 JSON complet
                    </summary>
                    <pre className="mt-2 text-xs text-white/80 overflow-auto max-h-96 bg-black/30 rounded p-3">
                      {JSON.stringify(dicResult, null, 2)}
                    </pre>
                  </details>
                </div>
              ) : (
                <div className="text-white/50 text-center py-8">
                  En attente d'extraction...
                </div>
              )}
            </div>

            {/* Johnson Result */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white">
                  🎯 Format Johnson (Nouveau)
                </h2>
                {johnsonResult && (
                  <span className="px-3 py-1 bg-purple-500/30 text-purple-200 rounded-full text-sm">
                    {johnsonResult.extraction.processing_time_ms}ms
                  </span>
                )}
              </div>
              
              {johnsonResult ? (
                <div className="space-y-3">
                  <div className="bg-black/20 rounded-lg p-4">
                    <h3 className="text-white/70 text-sm mb-2">Confiance</h3>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-white/10 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                          style={{ width: `${johnsonResult.extraction.confidence * 100}%` }}
                        />
                      </div>
                      <span className="text-white font-mono">
                        {(johnsonResult.extraction.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>

                  <div className="bg-black/20 rounded-lg p-4">
                    <h3 className="text-white/70 text-sm mb-2">Identification</h3>
                    <div className="space-y-1 text-sm">
                      <div className="text-white">
                        <span className="text-white/60">Produit:</span>{" "}
                        {johnsonResult.identification?.product_name || "❌"}
                      </div>
                      <div className="text-white">
                        <span className="text-white/60">Émetteur:</span>{" "}
                        {johnsonResult.identification?.issuer || "❌"}
                      </div>
                      <div className="text-white">
                        <span className="text-white/60">ISIN:</span>{" "}
                        {johnsonResult.identification?.isin || "❌"}
                      </div>
                      <div className="text-white">
                        <span className="text-white/60">Type:</span>{" "}
                        {johnsonResult.meta?.product_category || "❌"}
                      </div>
                    </div>
                  </div>

                  <div className="bg-black/20 rounded-lg p-4">
                    <h3 className="text-white/70 text-sm mb-2">📚 Pitch pédagogique</h3>
                    <p className="text-white/90 text-sm italic">
                      "{johnsonResult.pedagogical_explanation?.one_sentence_pitch || "Non disponible"}"
                    </p>
                  </div>

                  <div className="bg-black/20 rounded-lg p-4">
                    <h3 className="text-white/70 text-sm mb-2">✅ Comment gagner</h3>
                    <p className="text-green-200 text-sm">
                      {johnsonResult.pedagogical_explanation?.how_it_can_gain_money || "Non disponible"}
                    </p>
                  </div>

                  <div className="bg-black/20 rounded-lg p-4">
                    <h3 className="text-white/70 text-sm mb-2">⚠️ Comment perdre</h3>
                    <p className="text-red-200 text-sm">
                      {johnsonResult.pedagogical_explanation?.how_it_can_lose_money || "Non disponible"}
                    </p>
                  </div>

                  <details className="bg-black/20 rounded-lg p-4">
                    <summary className="text-white/70 cursor-pointer hover:text-white">
                      🔍 JSON complet
                    </summary>
                    <pre className="mt-2 text-xs text-white/80 overflow-auto max-h-96 bg-black/30 rounded p-3">
                      {JSON.stringify(johnsonResult, null, 2)}
                    </pre>
                  </details>
                </div>
              ) : (
                <div className="text-white/50 text-center py-8">
                  En attente d'extraction...
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
