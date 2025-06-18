"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"

interface PortfolioContextType {
    selectedPortfolioId: string | undefined
    setSelectedPortfolioId: (id: string) => void
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined)

export const PortfolioProvider = ({ children }: { children: ReactNode }) => {
    const [selectedPortfolioId, setSelectedPortfolioIdState] = useState<string | undefined>(undefined)

    useEffect(() => {
        const storedId = localStorage.getItem("selectedPortfolioId")
        if (storedId) {
            setSelectedPortfolioIdState(storedId)
        }
    }, [])

    const setSelectedPortfolioId = (id: string) => {
        setSelectedPortfolioIdState(id)
    }

    return (
        <PortfolioContext.Provider value={{ selectedPortfolioId, setSelectedPortfolioId }}>
            {children}
        </PortfolioContext.Provider>
    )
}

export const usePortfolio = () => {
    const context = useContext(PortfolioContext)
    if (!context) {
        throw new Error("usePortfolio must be used within a PortfolioProvider")
    }
    return context
}
