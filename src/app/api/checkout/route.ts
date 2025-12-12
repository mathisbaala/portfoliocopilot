import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Lazy initialization to avoid build-time errors when env vars are not available
function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-11-17.clover",
  });
}

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

    const { documentId, documentName } = await request.json();

    if (!documentId || !documentName) {
      return NextResponse.json(
        { error: "Document ID et nom requis" },
        { status: 400 }
      );
    }

    // Vérifier que le document appartient à l'utilisateur
    const { data: document, error: docError } = await supabase
      .from("documents")
      .select("id, user_id, payment_status")
      .eq("id", documentId)
      .single();

    if (docError || !document) {
      return NextResponse.json({ error: "Document non trouvé" }, { status: 404 });
    }

    if (document.user_id !== user.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    // Si déjà payé, ne pas recréer de session
    if (document.payment_status === "paid") {
      return NextResponse.json({ error: "Document déjà payé" }, { status: 400 });
    }

    // Mettre à jour le document avec payment_status='pending' et le montant
    await supabase
      .from("documents")
      .update({
        payment_status: "pending",
        payment_amount: 2.00,
      })
      .eq("id", documentId);

    console.log("Creating checkout session:", { documentId, documentName, userEmail: user.email });

    // Créer la session de paiement Stripe - TOUJOURS 2€ hardcodé côté serveur
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: `Analyse IA - ${documentName}`,
              description: "Extraction et analyse intelligente de votre document DIC",
            },
            unit_amount: 200, // 2€ en centimes - HARDCODÉ
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${request.nextUrl.origin}/dashboard?payment=success&document=${documentId}`,
      cancel_url: `${request.nextUrl.origin}/dashboard?payment=cancelled&document=${documentId}`,
      metadata: {
        userId: user.id,
        documentId,
        documentName,
      },
    };

    // Ajouter l'email seulement s'il est valide
    if (user.email && user.email.includes("@")) {
      sessionParams.customer_email = user.email;
    }

    const session = await getStripe().checkout.sessions.create(sessionParams);

    // Sauvegarder le checkout session ID
    await supabase
      .from("documents")
      .update({
        stripe_checkout_session_id: session.id,
      })
      .eq("id", documentId);

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création du paiement" },
      { status: 500 }
    );
  }
}
