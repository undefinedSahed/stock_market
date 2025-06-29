// src/providers/stripe-provider.tsx
import React from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string);

export default function StripeProvider({
    children,
    clientSecret,
}: {
    children: React.ReactNode;
    clientSecret: string;
}) {
    return (
        <Elements stripe={stripePromise} options={{ clientSecret }}>
            {children}
        </Elements>
    );
}
