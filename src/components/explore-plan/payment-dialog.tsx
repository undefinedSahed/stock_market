"use client";

import React, { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import PaymentSuccessModal from "./PaymentSuccessModal";
import PaymentFailureModal from "./PaymentFailureModal";

export default function CheckoutDialog({
    open,
    onOpenChange,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showFailureModal, setShowFailureModal] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!stripe || !elements) return;

        setLoading(true);

        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: window.location.origin + "/payment-success",
            },
            redirect: "if_required",
        });

        if (error) {
            setShowFailureModal(true);
        } else if (paymentIntent?.status === "succeeded") {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/confirm-payment`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    paymentIntentId: paymentIntent.id
                }),
            });
            onOpenChange(false); // Close payment dialog
            setShowSuccessModal(true); // Show success
        } else {
            setShowFailureModal(true);
        }

        setLoading(false);
    };

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Complete Your Payment</DialogTitle>
                        <DialogDescription>Use a secure method to complete your transaction.</DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <PaymentElement />
                        <button
                            type="submit"
                            disabled={!stripe || loading}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
                        >
                            {loading ? "Processing..." : "Pay Now"}
                        </button>
                    </form>
                </DialogContent>
            </Dialog>

            <PaymentSuccessModal open={showSuccessModal} onOpenChange={setShowSuccessModal} />
            <PaymentFailureModal open={showFailureModal} onOpenChange={setShowFailureModal} />
        </>
    );
}
