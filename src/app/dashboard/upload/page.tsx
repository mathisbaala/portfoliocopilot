"use client";

import { useState, useCallback } from "react";
import { Upload, FileText, X, Loader2, CheckCircle2, AlertCircle, Download, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import type { DICData } from "@/types/dic-data";
import { saveExtraction } from "@/lib/storage";

interface UploadedFile {
  file: File;
  id: string;
  status: "uploading" | "extracting" | "success" | "error";
  progress: number;
  data?: DICData;
  error?: string;
}

export default function UploadPage() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files).filter(
      (file) => file.type === "application/pdf"
    );

    if (droppedFiles.length === 0) {
      toast.error("Seuls les fichiers PDF sont acceptés");
      return;
    }

    handleFiles(droppedFiles);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      handleFiles(selectedFiles);
    }
  }, []);

  const handleFiles = async (newFiles: File[]) => {
    const uploadedFiles: UploadedFile[] = newFiles.map((file) => ({
      file,
      id: Math.random().toString(36).substring(7),
      status: "uploading",
      progress: 0,
    }));

    setFiles((prev) => [...prev, ...uploadedFiles]);

    // Process each file
    for (const uploadedFile of uploadedFiles) {
      await processFile(uploadedFile);
    }
  };

  const processFile = async (uploadedFile: UploadedFile) => {
    try {
      // 1. Upload to Supabase Storage
      updateFileStatus(uploadedFile.id, "uploading", 10);
      toast.info(`📤 Upload de ${uploadedFile.file.name}...`);
      
      const formData = new FormData();
      formData.append("file", uploadedFile.file);

      updateFileStatus(uploadedFile.id, "uploading", 30);

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const uploadData = await uploadResponse.json();

      if (!uploadResponse.ok) {
        throw new Error(uploadData.error || "Erreur lors de l'upload");
      }

      const { fileUrl } = uploadData;
      updateFileStatus(uploadedFile.id, "uploading", 50);

      // 2. Extract data with AI
      updateFileStatus(uploadedFile.id, "extracting", 60);
      toast.info(`🤖 Analyse IA en cours...`);

      const extractResponse = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileUrl, fileName: uploadedFile.file.name }),
      });

      const extractData = await extractResponse.json();

      if (!extractResponse.ok) {
        throw new Error(extractData.error || extractData.details || "Erreur lors de l'extraction");
      }

      // Check if extraction was successful
      if (extractData.error) {
        throw new Error(extractData.error);
      }

      const data: DICData = extractData;
      updateFileStatus(uploadedFile.id, "extracting", 90);

      // 3. Success
      updateFileStatus(uploadedFile.id, "success", 100, data);
      
      // Save to localStorage
      saveExtraction(uploadedFile.file.name, data);
      
      const confidence = ((data.extraction?.confidence || 0) * 100).toFixed(0);
      toast.success(`✅ ${uploadedFile.file.name} analysé avec succès ! (confiance: ${confidence}%)`);

    } catch (error) {
      console.error("Error processing file:", error);
      const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
      
      updateFileStatus(
        uploadedFile.id,
        "error",
        0,
        undefined,
        errorMessage
      );
      
      toast.error(`❌ ${uploadedFile.file.name}: ${errorMessage}`);
    }
  };

  const updateFileStatus = (
    id: string,
    status: UploadedFile["status"],
    progress: number,
    data?: DICData,
    error?: string
  ) => {
    setFiles((prev) =>
      prev.map((f) =>
        f.id === id ? { ...f, status, progress, data, error } : f
      )
    );
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const downloadJSON = (file: UploadedFile) => {
    if (!file.data) return;

    const blob = new Blob([JSON.stringify(file.data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${file.file.name.replace(".pdf", "")}_data.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
          Upload & Extraction
        </h1>
        <p className="text-lg text-slate-600 mt-2">
          Uploadez vos DIC (PDF) pour extraire automatiquement les données
        </p>
      </div>

      {/* Drop Zone */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card
          className={`border-2 border-dashed transition-all duration-300 ${
            isDragging
              ? "border-blue-600 bg-blue-50 scale-[1.02] shadow-lg"
              : "border-slate-300 hover:border-blue-400 hover:shadow-md"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <CardContent className="py-16">
            <div className="text-center space-y-4">
              <motion.div
                className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center"
                animate={isDragging ? { scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] } : {}}
                transition={{ duration: 0.5 }}
              >
                <Upload className="w-8 h-8 text-white" />
              </motion.div>
            <div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                Glissez-déposez vos fichiers PDF ici
              </h3>
              <p className="text-slate-600">ou</p>
            </div>
            <div>
              <input
                type="file"
                id="file-input"
                className="hidden"
                accept=".pdf,application/pdf"
                multiple
                onChange={handleFileInput}
              />
              <label htmlFor="file-input">
                <Button size="lg" className="cursor-pointer" asChild>
                  <span>Sélectionner des fichiers</span>
                </Button>
              </label>
            </div>
            <p className="text-sm text-slate-500">
              Formats acceptés : PDF uniquement • Taille max : 10 MB
            </p>
          </div>
        </CardContent>
      </Card>
      </motion.div>

      {/* Files List */}
      <AnimatePresence mode="popLayout">
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900">
                Fichiers ({files.length})
              </h2>
              {files.some(f => f.status === "success") && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    files.filter(f => f.status === "success").forEach(f => downloadJSON(f));
                    toast.success("Téléchargement de tous les fichiers réussis");
                  }}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Tout télécharger
                </Button>
              )}
            </div>

            {files.map((file, index) => (
              <motion.div
                key={file.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="flex-shrink-0">
                    {file.status === "success" ? (
                      <CheckCircle2 className="w-8 h-8 text-green-600" />
                    ) : file.status === "error" ? (
                      <AlertCircle className="w-8 h-8 text-red-600" />
                    ) : (
                      <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-slate-400 flex-shrink-0" />
                          <h3 className="font-semibold text-slate-900 truncate">
                            {file.file.name}
                          </h3>
                        </div>
                        <p className="text-sm text-slate-500 mt-1">
                          {(file.file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => removeFile(file.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Status */}
                    <div className="mt-4">
                      {file.status === "uploading" && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-600">Upload en cours...</span>
                            <span className="text-slate-900 font-medium">{file.progress}%</span>
                          </div>
                          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-600 transition-all duration-300"
                              style={{ width: `${file.progress}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {file.status === "extracting" && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-600">Extraction IA en cours...</span>
                            <span className="text-slate-900 font-medium">{file.progress}%</span>
                          </div>
                          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-300"
                              style={{ width: `${file.progress}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {file.status === "success" && file.data && (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg">
                            <CheckCircle2 className="w-4 h-4" />
                            <span className="font-medium">
                              Extraction réussie • Confiance: {(file.data.extraction.confidence * 100).toFixed(0)}%
                            </span>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
                            <div className="bg-slate-50 px-3 py-2 rounded-lg">
                              <div className="text-slate-500">Émetteur</div>
                              <div className="font-semibold text-slate-900 truncate">
                                {file.data.general.emetteur}
                              </div>
                            </div>
                            <div className="bg-slate-50 px-3 py-2 rounded-lg">
                              <div className="text-slate-500">Risque</div>
                              <div className="font-semibold text-slate-900">
                                {file.data.risque.niveau}/7
                              </div>
                            </div>
                            <div className="bg-slate-50 px-3 py-2 rounded-lg">
                              <div className="text-slate-500">Frais</div>
                              <div className="font-semibold text-slate-900">
                                {file.data.frais.gestionAnnuels}%
                              </div>
                            </div>
                            <div className="bg-slate-50 px-3 py-2 rounded-lg">
                              <div className="text-slate-500">Horizon</div>
                              <div className="font-semibold text-slate-900 truncate">
                                {file.data.horizon.recommande}
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => downloadJSON(file)}
                            className="w-full sm:w-auto"
                          >
                            📥 Télécharger JSON
                          </Button>
                        </div>
                      )}

                      {file.status === "error" && (
                        <div className="text-sm text-red-700 bg-red-50 px-3 py-2 rounded-lg">
                          ❌ {file.error}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
}
