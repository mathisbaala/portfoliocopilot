import { createServerSupabase } from "@/lib/supabase-server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabase();

    // Vérifier l'authentification
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "Non autorisé. Veuillez vous connecter." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get("id");
    const action = searchParams.get("action");

    // Si on demande l'URL signée d'un document spécifique
    if (documentId && action === "url") {
      const { data: document, error: fetchError } = await supabase
        .from("documents")
        .select("*")
        .eq("id", documentId)
        .single();

      if (fetchError || !document) {
        return NextResponse.json(
          { error: "Document non trouvé" },
          { status: 404 }
        );
      }

      // Créer l'URL signée (1 heure d'expiration)
      const { data: signedUrlData, error: signedError } = await supabase.storage
        .from("dic-documents")
        .createSignedUrl(document.storage_path, 3600);

      if (signedError || !signedUrlData) {
        return NextResponse.json(
          { error: "Impossible de créer l'URL signée" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        signedUrl: signedUrlData.signedUrl,
        document,
      });
    }

    // Sinon, récupérer tous les documents de l'utilisateur
    const { data: documents, error } = await supabase
      .from("documents")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      documents,
    });

  } catch (error) {
    console.error("❌ Fetch documents error:", error);
    return NextResponse.json(
      { 
        error: "Erreur lors de la récupération des documents",
        details: error instanceof Error ? error.message : "Erreur inconnue"
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createServerSupabase();

    // Vérifier l'authentification
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "Non autorisé. Veuillez vous connecter." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get("id");

    if (!documentId) {
      return NextResponse.json(
        { error: "ID du document requis" },
        { status: 400 }
      );
    }

    // Récupérer le document (RLS vérifie automatiquement la propriété)
    const { data: document, error: fetchError } = await supabase
      .from("documents")
      .select("*")
      .eq("id", documentId)
      .single();

    if (fetchError || !document) {
      return NextResponse.json(
        { error: "Document non trouvé" },
        { status: 404 }
      );
    }

    // Supprimer le fichier du storage
    const { error: storageError } = await supabase.storage
      .from("dic-documents")
      .remove([document.storage_path]);

    if (storageError) {
      console.error("Storage deletion error:", storageError);
      // Continue quand même pour supprimer l'entrée DB
    }

    // Supprimer l'entrée de la base de données
    const { error: deleteError } = await supabase
      .from("documents")
      .delete()
      .eq("id", documentId);

    if (deleteError) {
      throw deleteError;
    }

    console.log(`🗑️ Document ${documentId} supprimé par ${user.email}`);

    return NextResponse.json({
      success: true,
      message: "Document supprimé avec succès",
    });

  } catch (error) {
    console.error("❌ Delete document error:", error);
    return NextResponse.json(
      { 
        error: "Erreur lors de la suppression",
        details: error instanceof Error ? error.message : "Erreur inconnue"
      },
      { status: 500 }
    );
  }
}
