import { NextRequest, NextResponse } from "next/server";
import { authenticate } from "@/lib/middleware";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
});

const PLANS = {
  starter: { price: 49, name: "Starter" },
  business: { price: 149, name: "Business" },
  enterprise: { price: 399, name: "Enterprise" },
};

export async function POST(req: NextRequest) {
  const auth = await authenticate(req);
  if (auth.error) return auth.error;

  const { selectedPlan } = await req.json();

  if (!selectedPlan) {
    return NextResponse.json(
      { error: "Plan requis" },
      { status: 400 }
    );
  }

  const plan = PLANS[selectedPlan as keyof typeof PLANS];
  if (!plan) {
    return NextResponse.json({ error: "Plan invalide" }, { status: 400 });
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount: plan.price * 100,
    currency: "eur",
    metadata: { 
      plan: selectedPlan, 
      userId: auth.userId!,
      type: "onboarding"
    },
  });

  return NextResponse.json({
    clientSecret: paymentIntent.client_secret,
    amount: plan.price,
    plan: selectedPlan,
  });
}
