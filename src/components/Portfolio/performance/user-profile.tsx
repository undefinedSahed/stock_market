import { useQuery } from "@tanstack/react-query"
import { useSession } from "next-auth/react"
import Image from "next/image"
import { usePortfolio } from "../portfolioContext"

export function UserProfile() {

    const { selectedPortfolioId } = usePortfolio()

    const { data: session } = useSession();
    const userId = session?.user?.id;

    const { data: user } = useQuery({
        queryKey: ["user"],
        queryFn: async () => {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/get-user/${userId}`);
            const data = await res.json();
            return data;
        },
        select: (data) => data?.data,
        enabled: !!userId
    });


    const { data: portfolioData } = useQuery({
        queryKey: ["portfolio", selectedPortfolioId],
        queryFn: async () => {
            if (!selectedPortfolioId) {
                return null;
            }
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/portfolio/get/${selectedPortfolioId}`, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${session?.user?.accessToken}`,
                },
            });
            const data = await res.json();
            return data;
        },
        enabled: !!session?.user?.accessToken && !!selectedPortfolioId,
    });
    console.log(user)

    return (
        <div className="flex flex-col items-center justify-center gap-4 p-4 bg-white rounded-lg shadow-sm ">
            <div className="flex-shrink-0">
                <div className="relative w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden border-2 border-gray-200">
                    <Image src={user?.profilePhoto || "/placeholder.svg"} alt={user?.name} fill className="object-cover" />
                </div>
            </div>

            <div className="flex flex-col items-center">
                <h2 className="text-xl md:text-2xl font-bold text-gray-800">{user?.fullName}</h2>
                <p className="text-sm text-gray-600 mt-1">{portfolioData && portfolioData.name}</p>
            </div>
        </div>
    )
}
