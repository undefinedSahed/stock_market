"use client"

import React, { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTrigger,
} from "@/components/ui/dialog" // Assuming Shadcn UI Dialog
import { Button } from "@/components/ui/button" // Assuming Shadcn UI Button
import AddStockSearch from "./add-holding-main" // Import the simplified search component
import { Plus } from "lucide-react"

interface AddToPortfolioDialogProps {
    triggerButtonText?: string;
    onDialogClose?: () => void;
}

export default function AddToPortfolioDialog({ onDialogClose }: AddToPortfolioDialogProps) {
    const [isOpen, setIsOpen] = useState(false);

    const handleStockAdded = () => {
        setIsOpen(false);
        if (onDialogClose) {
            onDialogClose();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button className="bg-green-500 hover:bg-green-600 text-white">
                    <Plus className="mr-2 h-4 w-4" /> Add Holding
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] md:max-w-lg lg:max-w-2xl p-4 pb-36">
                <DialogHeader>
                    <h2 className="text-lg font-semibold">Add Stock to Portfolio</h2>
                </DialogHeader>
                <AddStockSearch onStockAdded={handleStockAdded} />
            </DialogContent>
        </Dialog>
    )
}