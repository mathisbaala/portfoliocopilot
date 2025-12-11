import { createServerSupabase } from "@/lib/supabase-server";
import { NextRequest, NextResponse } from "next/server";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPE = "application/pdf";

export async function POST(request: NextRequest) {
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

    const formData = await request.formData();
    const file = formData.get("file") as File;

    // Validations
    if (!file) {
      return NextResponse.json({ error: "Aucun fichier fourni" }, { status: 400 });
    }

    if (file.type !== ALLOWED_FILE_TYPE) {
      return NextResponse.json({ error: "Seuls les fichiers PDF sont acceptés" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `Fichier trop volumineux (max 10MB)` },
        { status: 400 }
      );
    }

    if (!/^[\w\-. ]+\.pdf$/i.test(file.name)) {
      return NextResponse.json(
        { error: "Nom de fichier invalide" },
        { status: 400 }
      );
    }

    console.log(`📤 ${file.name} (${(file.size / 1024).toFixed(0)}KB) - User: ${user.email}`);

    // Generate unique filename
    const timestamp = Date.now();
    const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const fileName = `${user.id}/${timestamp}_${cleanName}`;

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Supabase Storage
    const { data: storageData, error: storageError } = await supabase.storage
      .from("dic-documents")
      .upload(fileName, buffer, {
        contentType: "application/pdf",
        upsert: false,
      });

    if (storageError) {
      throw storageError;
    }

    // Créer l'entrée dans la table documents
    const { data: documentData, error: documentError } = await supabase
      .from("documents")
      .insert({
        user_id: user.id,
        filename: file.name,
        mime_type: file.type,
        file_size: file.size,
        storage_path: storageData.path,
        status: "uploaded",
      })
      .select()
      .single();

    if (documentError) {
      // Rollback: supprimer le fichier uploadé si l'insertion échoue
      await supabase.storage.from("dic-documents").remove([fileName]);
      throw documentError;
    }

    // Create signed URL (1 hour expiration)
    const { data: signedUrlData, error: signedError } = await supabase.storage
      .from("dic-documents")
      .createSignedUrl(fileName, 3600);

    if (signedError || !signedUrlData) {
      throw new Error("Failed to create signed URL");
    }

    console.log(`✅ ${fileName}`);

    return NextResponse.json({
      success: true,
      document: documentData,
      fileName,
      fileUrl: signedUrlData.signedUrl,
      filePath: storageData.path,
      fileSize: file.size,
    });

  } catch (error) {
    console.error("❌ Upload error:", error);
    return NextResponse.json(
      { 
        error: "Erreur lors de l'upload",
        details: error instanceof Error ? error.message : "Erreur inconnue"
      },
      { status: 500 }
    );
  }
}
