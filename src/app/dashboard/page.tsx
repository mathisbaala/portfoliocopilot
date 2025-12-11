"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Upload, FileText, TrendingUp, ArrowRight, Trash2, Loader2, RefreshCw, AlertCircle } from "lucide-react";
import Link from "next/link";
import { availableProducts } from "@/config/products";
import { useAuth } from "@/context/auth-context";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type Document = {
  id: string;
  filename: string;
  status: string;
  file_size: number;
  created_at: string;
  storage_path: string;
};

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchDocuments = useCallback(async () => {
    try {
      setLoadingDocs(true);
      const res = await fetch("/api/documents");
      const data = await res.json();
      
      if (res.ok) {
        setDocuments(data.documents || []);
      } else {
        console.error("Fetch error:", data.error);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoadingDocs(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }
    
    if (user) {
      fetchDocuments();
    }
  }, [user, authLoading, router, fetchDocuments]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      
      const data = await res.json();
      
      if (res.ok) {
        toast.success("Document uploadé avec succès !");
        fetchDocuments();
      } else {
        toast.error(data.error || "Erreur lors de l'upload");
      }
    } catch (error) {
      toast.error("Erreur réseau lors de l'upload");
      console.error("Upload error:", error);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleDelete = async (documentId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce document ?")) return;

    setDeletingId(documentId);
    try {
      const res = await fetch(`/api/documents?id=${documentId}`, {
        method: "DELETE",
      });
      
      const data = await res.json();
      
      if (res.ok) {
        toast.success("Document supprimé");
        setDocuments(docs => docs.filter(d => d.id !== documentId));
      } else {
        toast.error(data.error || "Erreur lors de la suppression");
      }
    } catch (error) {
      toast.error("Erreur réseau");
      console.error("Delete error:", error);
    } finally {
      setDeletingId(null);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-3">
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
          Dashboard
        </h1>
        <p className="text-lg text-slate-600">
          Bienvenue, <span className="font-semibold">{user.email}</span>. Gérez vos documents DIC.
        </p>
      </div>

      {/* Stats Cards */}
      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { title: "Documents uploadés", icon: FileText, value: documents.length.toString(), color: "from-blue-500 to-blue-600" },
          { title: "Analyses en cours", icon: TrendingUp, value: documents.filter(d => d.status === "processing").length.toString(), color: "from-blue-600 to-blue-700" },
          { title: "Produits disponibles", icon: Upload, value: availableProducts.length.toString(), color: "from-blue-700 to-blue-800" }
        ].map((item, k) => (
          <Card key={k} className="hover:shadow-premium transition-all duration-300">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold text-slate-700">{item.title}</CardTitle>
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-md`}>
                  <item.icon className="w-5 h-5 text-white" />
                </div>
              </div>
            </CardHeader>
            <Separator />
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-slate-900">{item.value}</div>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* Upload Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Uploader un DIC</h2>
            <p className="text-slate-600 mt-1">Glissez-déposez ou sélectionnez un fichier PDF</p>
          </div>
        </div>

        <Card className="border-2 border-dashed border-slate-200 hover:border-blue-400 transition-colors">
          <CardContent className="p-8">
            <label className="flex flex-col items-center justify-center cursor-pointer">
              <input
                type="file"
                accept=".pdf"
                onChange={handleUpload}
                disabled={uploading}
                className="hidden"
              />
              {uploading ? (
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
              ) : (
                <Upload className="w-12 h-12 text-slate-400 mb-4" />
              )}
              <span className="text-lg font-semibold text-slate-700">
                {uploading ? "Upload en cours..." : "Cliquez pour sélectionner un PDF"}
              </span>
              <span className="text-sm text-slate-500 mt-2">
                Format accepté : PDF (max 10 MB)
              </span>
            </label>
          </CardContent>
        </Card>
      </section>

      {/* Documents List */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Mes documents</h2>
            <p className="text-slate-600 mt-1">
              {documents.length} document{documents.length !== 1 ? "s" : ""} uploadé{documents.length !== 1 ? "s" : ""}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchDocuments} disabled={loadingDocs}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loadingDocs ? "animate-spin" : ""}`} />
            Actualiser
          </Button>
        </div>

        {loadingDocs ? (
          <Card>
            <CardContent className="p-8 flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            </CardContent>
          </Card>
        ) : documents.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600">Aucun document uploadé</p>
              <p className="text-sm text-slate-500 mt-1">Commencez par uploader votre premier DIC</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {documents.map((doc) => (
              <Card key={doc.id} className="hover:shadow-lg transition-all duration-300">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="w-5 h-5 text-blue-600 flex-shrink-0" />
                        <h3 className="font-semibold text-slate-900 truncate" title={doc.filename}>
                          {doc.filename}
                        </h3>
                      </div>
                      <div className="text-sm text-slate-500 space-y-1">
                        <p>{formatFileSize(doc.file_size)}</p>
                        <p>{formatDate(doc.created_at)}</p>
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                          doc.status === "ready" ? "bg-green-100 text-green-700" :
                          doc.status === "processing" ? "bg-yellow-100 text-yellow-700" :
                          doc.status === "failed" ? "bg-red-100 text-red-700" :
                          "bg-slate-100 text-slate-700"
                        }`}>
                          {doc.status === "ready" ? "Prêt" :
                           doc.status === "processing" ? "En cours" :
                           doc.status === "failed" ? "Erreur" : "Uploadé"}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(doc.id)}
                      disabled={deletingId === doc.id}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      {deletingId === doc.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Available Products Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Produits disponibles</h2>
            <p className="text-slate-600 mt-1">
              Consultez les analyses de produits pré-chargés
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {availableProducts.map((product) => (
            <Link
              key={product.id}
              href={`/product/${product.id}`}
              className="group"
            >
              <Card className="hover:shadow-lg transition-all duration-300 hover:border-blue-500 cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-slate-900 group-hover:text-blue-600 transition-colors">
                        {product.frontendProductName}
                      </h3>
                      <p className="text-sm text-slate-500 mt-1">
                        Consulter le dashboard
                      </p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
