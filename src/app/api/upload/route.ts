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

    // Validation 1: File exists
    if (!file) {
      console.error("❌ Upload failed: No file provided");
      return NextResponse.json(
        { error: "Aucun fichier fourni" },
        { status: 400 }
      );
    }

    // Validation 2: File type
    if (file.type !== ALLOWED_FILE_TYPE) {
      console.error(`❌ Upload failed: Invalid file type (${file.type})`);
      return NextResponse.json(
        { error: `Seuls les fichiers PDF sont acceptés (type reçu: ${file.type})` },
        { status: 400 }
      );
    }

    // Validation 3: File size
    if (file.size > MAX_FILE_SIZE) {
      const sizeMB = (file.size / 1024 / 1024).toFixed(2);
      console.error(`❌ Upload failed: File too large (${sizeMB}MB)`);
      return NextResponse.json(
        { error: `Fichier trop volumineux (${sizeMB}MB, max 10MB)` },
        { status: 400 }
      );
    }

    // Validation 4: File name safety
    if (!/^[\w\-. ]+\.pdf$/i.test(file.name)) {
      console.error(`❌ Upload failed: Invalid file name (${file.name})`);
      return NextResponse.json(
        { error: "Nom de fichier invalide. Utilisez uniquement des lettres, chiffres et tirets." },
        { status: 400 }
      );
    }

    console.log(`📤 Uploading file: ${file.name} (${(file.size / 1024).toFixed(0)}KB)`);

    // Generate unique filename
    const timestamp = Date.now();
    const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const fileName = `${timestamp}_${cleanName}`;

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Supabase Storage with retry logic
    let uploadAttempts = 0;
    const MAX_RETRIES = 3;
    let uploadError: Error | null = null;

    while (uploadAttempts < MAX_RETRIES) {
      try {
        const { data, error } = await supabase.storage
          .from("dic-documents")
          .upload(fileName, buffer, {
            contentType: "application/pdf",
            upsert: false,
          });

        if (error) {
          throw error;
        }

        // Success - Get public URL
        const { data: urlData } = supabase.storage
          .from("dic-documents")
          .getPublicUrl(fileName);

        console.log(`✅ Upload successful: ${fileName}`);

        return NextResponse.json({
          success: true,
          fileName,
          fileUrl: urlData.publicUrl,
          filePath: data.path,
          fileSize: file.size,
        });

      } catch (err) {
        uploadAttempts++;
        uploadError = err as Error;
        console.error(`❌ Upload attempt ${uploadAttempts}/${MAX_RETRIES} failed:`, err);
        
        if (uploadAttempts < MAX_RETRIES) {
          // Wait before retry (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 1000 * uploadAttempts));
        }
      }
    }

    // All retries failed
    console.error("❌ Upload failed after all retries:", uploadError);
    return NextResponse.json(
      { 
        error: "Erreur lors de l'upload vers le stockage",
        details: uploadError?.message || "Erreur inconnue",
        retries: MAX_RETRIES
      },
      { status: 500 }
    );

  } catch (error) {
    console.error("❌ Unexpected upload error:", error);
    return NextResponse.json(
      { 
        error: "Erreur serveur lors de l'upload",
        details: error instanceof Error ? error.message : "Erreur inconnue"
      },
      { status: 500 }
    );
  }
}
