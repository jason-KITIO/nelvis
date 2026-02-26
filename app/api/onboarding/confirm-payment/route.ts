import { NextRequest, NextResponse } from "next/server";
import { authenticate } from "@/lib/middleware";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-01-28.clover",
});

export async function POST(req: NextRequest) {
  const auth = await authenticate(req);
  if (auth.error) return auth.error;

  const { paymentIntentId } = await req.json();

  if (!paymentIntentId) {
    return NextResponse.json(
      { error: "Payment Intent ID requis" },
      { status: 400 }
    );
  }

  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

  if (paymentIntent.status !== "succeeded") {
    return NextResponse.json(
      { error: "Paiement non confirmé", status: paymentIntent.status },
      { status: 400 }
    );
  }

  return NextResponse.json({
    success: true,
    status: paymentIntent.status,
    amount: paymentIntent.amount / 100,
    plan: paymentIntent.metadata.plan,
  });
}
