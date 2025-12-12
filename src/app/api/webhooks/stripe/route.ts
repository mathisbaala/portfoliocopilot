import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-11-17.clover",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// Client Supabase admin pour les webhooks (pas de cookies ici)
// Note: En production, utilise SUPABASE_SERVICE_ROLE_KEY pour bypasser RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing stripe-signature header" },
        { status: 400 }
      );
    }

    let event: Stripe.Event;

    try {
      // IMPORTANT: Vérifier la signature du webhook
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      );
    }

    // Traiter les différents événements
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        
        const { userId, documentId, documentName } = session.metadata || {};
        
        if (userId && documentId) {
          console.log(`Payment successful for document ${documentId} by user ${userId}`);
          
          // Mettre à jour le document avec payment_status='paid'
          const { error: updateError } = await supabaseAdmin
            .from("documents")
            .update({
              payment_status: "paid",
              stripe_checkout_session_id: session.id,
              stripe_payment_intent_id: session.payment_intent as string,
            })
            .eq("id", documentId);

          if (updateError) {
            console.error("Error updating document payment status:", updateError);
          } else {
            console.log(`✅ Document ${documentName} marked as paid and ready for analysis`);
          }
        }
        break;
      }

      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log(`PaymentIntent ${paymentIntent.id} succeeded`);
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.error(`Payment failed: ${paymentIntent.last_payment_error?.message}`);
        
        // Mettre à jour le statut en 'failed' si on a le documentId
        // Note: Le documentId n'est pas dans payment_intent.metadata par défaut
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}
