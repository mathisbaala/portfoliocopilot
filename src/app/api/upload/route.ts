import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

// Validate environment variables
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable");
}
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable");
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPE = "application/pdf";

export async function POST(request: NextRequest) {
  try {
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

    console.log(`📤 ${file.name} (${(file.size / 1024).toFixed(0)}KB)`);

    // Generate unique filename
    const timestamp = Date.now();
    const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const fileName = `${timestamp}_${cleanName}`;

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from("dic-documents")
      .upload(fileName, buffer, {
        contentType: "application/pdf",
        upsert: false,
      });

    if (error) {
      throw error;
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
      fileName,
      fileUrl: signedUrlData.signedUrl,
      filePath: data.path,
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
