import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { documentId } = await request.json();

    if (!documentId) {
      return NextResponse.json({ error: "Document ID requis" }, { status: 400 });
    }

    // Récupérer le document et vérifier le paiement
    const { data: document, error: docError } = await supabase
      .from("documents")
      .select("*")
      .eq("id", documentId)
      .single();

    if (docError || !document) {
      return NextResponse.json({ error: "Document non trouvé" }, { status: 404 });
    }

    // SÉCURITÉ: Vérifier que le document appartient à l'utilisateur
    if (document.user_id !== user.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    // SÉCURITÉ: Vérifier que le paiement a été effectué
    if (document.payment_status !== "paid") {
      return NextResponse.json(
        { error: "Paiement requis avant l'analyse" },
        { status: 402 } // Payment Required
      );
    }

    // Vérifier que le document n'a pas déjà été analysé
    if (document.status === "ready") {
      return NextResponse.json(
        { error: "Document déjà analysé" },
        { status: 400 }
      );
    }

    // Mettre à jour le statut en 'processing'
    await supabase
      .from("documents")
      .update({ status: "processing" })
      .eq("id", documentId);

    // Récupérer l'URL signée du document
    const { data: signedUrlData } = await supabase.storage
      .from("dic-documents")
      .createSignedUrl(document.storage_path, 3600);

    if (!signedUrlData?.signedUrl) {
      throw new Error("Impossible de récupérer le document");
    }

    // Lancer l'extraction (appel à l'API extract existante)
    const extractRes = await fetch(`${request.nextUrl.origin}/api/extract`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fileUrl: signedUrlData.signedUrl,
        fileName: document.filename,
      }),
    });

    const extractData = await extractRes.json();

    if (!extractRes.ok) {
      // Marquer comme failed
      await supabase
        .from("documents")
        .update({ status: "failed" })
        .eq("id", documentId);
      
      throw new Error(extractData.error || "Erreur lors de l'extraction");
    }

    // Sauvegarder les données extraites
    await supabase
      .from("documents")
      .update({
        status: "ready",
        extracted: extractData,
      })
      .eq("id", documentId);

    return NextResponse.json({
      success: true,
      data: extractData,
    });
  } catch (error) {
    console.error("Generate error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erreur lors de la génération" },
      { status: 500 }
    );
  }
}
