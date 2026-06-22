import type Stripe from "stripe";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function getOrCreateStripeCustomer(
  stripe: Stripe,
  admin: SupabaseClient,
  userId: string,
  email?: string | null,
): Promise<string> {
  const { data: profile, error } = await admin
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", userId)
    .maybeSingle();

  if (error) throw error;
  if (profile?.stripe_customer_id) return profile.stripe_customer_id;

  const customer = await stripe.customers.create({
    email: email?.trim() || undefined,
    metadata: { supabase_user_id: userId },
  });

  const { error: updateError } = await admin
    .from("profiles")
    .update({ stripe_customer_id: customer.id })
    .eq("id", userId);

  if (updateError) throw updateError;
  return customer.id;
}
