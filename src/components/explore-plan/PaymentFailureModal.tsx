"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function PaymentFailureModal({ open, onOpenChange }: {
    open: boolean
    onOpenChange: (open: boolean) => void
}) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md text-center">
                <DialogHeader>
                    <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <DialogTitle className="text-2xl font-bold">Payment Failed</DialogTitle>
                </DialogHeader>
                <p className="text-sm text-gray-600 mt-2">
                    😞 Something went wrong with your payment. Please try again.
                </p>
                <DialogFooter className="mt-6">
                    <Button className="w-full bg-green-500 hover:bg-green-600" onClick={() => onOpenChange(false)}>
                        Try Again
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
