"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Pencil, Mail, Lock } from "lucide-react"
import { BiUser } from "react-icons/bi"

import SubscriptionCard from "./subscription-card"
import FeedbackCard from "./feedback-card"
import { useSession } from "next-auth/react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

// Define a proper type instead of using `any`
interface ProfileData {
    fullName: string
    email: string
    address?: string
    profilePhoto?: File | null // Add profilePhoto to the type
}

interface PersonalDetailsProps {
    selectedImage: File | null;
    setImagePreview: React.Dispatch<React.SetStateAction<string | null>>;
}

export default function PersonalDetailsCard({ selectedImage, setImagePreview }: PersonalDetailsProps) {
    const { data: session } = useSession()
    const userId = session?.user?.id
    const queryClient = useQueryClient()

    const { data: user, isLoading: userLoading } = useQuery({
        queryKey: ["user"],
        queryFn: async () => {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/get-user/${userId}`)
            const data = await res.json()
            return data
        },
        select: (data) => data?.data,
        enabled: !!userId,
    })

    const [userData, setUserData] = useState({
        userName: session?.user?.name || "",
        fullName: "",
        email: "",
        address: "",
        password: "••••••",
    })

    const [editingField, setEditingField] = useState<string | null>(null)
    const [tempValue, setTempValue] = useState("")
    const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false)
    const [oldPassword, setOldPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")

    useEffect(() => {
        if (user) {
            setUserData({
                userName: session?.user?.name || "",
                fullName: user.fullName || "",
                email: user.email || "",
                address: user.address || "",
                password: "••••••",
            })
        }
    }, [user, session?.user?.name])

    const updateProfileMutation = useMutation({
        mutationFn: async (profileData: ProfileData) => {
            const formData = new FormData();
            formData.append("id", userId || "");
            formData.append("userName", session?.user?.name || "");
            formData.append("fullName", profileData.fullName);
            formData.append("email", profileData.email);
            formData.append("address", profileData.address || "");

            if (profileData.profilePhoto) { // Append image if it exists
                formData.append("imageLink", profileData.profilePhoto);
            }

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/update-user`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${session?.user?.accessToken}`, // Do NOT set Content-Type for FormData, browser sets it
                },
                body: formData,
            })

            if (!response.ok) throw new Error("Failed to update profile")

            return response.json()
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["user"] })
            toast.success("Profile updated successfully!")
            setImagePreview(null);
        },
        onError: (error: unknown) => {
            const message = error instanceof Error ? error.message : "Failed to update profile"
            toast.error(message)
        },
    })

    const resetPasswordMutation = useMutation({
        mutationFn: async ({ oldPassword, newPassword }: { oldPassword: string, newPassword: string }) => {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/update-password`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${session?.user?.accessToken}`,
                },
                body: JSON.stringify({
                    id: userId,
                    oldPassword,
                    newPassword,
                }),
            });

            if (!response.ok) throw new Error("Failed to update password");

            return response.json();
        },
        onSuccess: () => {
            toast.success("Password updated successfully!")
            setIsPasswordDialogOpen(false)
            setOldPassword("")
            setNewPassword("")
            setConfirmPassword("")
        },
        onError: (error) => {
            const message = error instanceof Error ? error.message : "Failed to reset password";
            toast.error(message)
        },
    })

    const handleEdit = (field: string, value: string) => {
        setEditingField(field)
        setTempValue(value)
    }

    const handleSave = (field: string) => {
        // This handleSave is for local state changes, the actual API call happens in handleSaveChanges
        if (field === "phoneNumber" && !isValidPhoneNumber(tempValue)) {
            toast.error("Invalid phone number")
            return
        }

        const updatedData = { ...userData, [field]: tempValue }
        setUserData(updatedData)
        setEditingField(null)
        // No toast here as the main save button will show success/error for API call
    }

    const handleCancel = () => setEditingField(null)

    const handlePasswordChange = () => {
        if (!oldPassword) {
            toast.error("Please enter your old password");
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error("New and confirm passwords don't match")
            return
        }

        if (newPassword.length < 6) {
            toast.error("New password is too short (minimum 6 characters)")
            return
        }

        resetPasswordMutation.mutate({ oldPassword, newPassword }) // Pass oldPassword and newPassword
    }

    const handleSaveChanges = () => {
        // Combine userData with selectedImage for the mutation
        updateProfileMutation.mutate({ ...userData, profilePhoto: selectedImage });
    }

    const isValidPhoneNumber = useCallback((phone: string) => /^\+?[0-9\s\-()]{10,20}$/.test(phone), [])


    return (
        <div className="md:grid md:grid-cols-2 lg:grid-cols-9 gap-5 mb-32">
            <div className="lg:col-span-7">
                <Card className="w-full shadow-md">
                    <CardHeader>
                        <CardTitle className="text-xl">Personal Details</CardTitle>
                    </CardHeader>
                    {
                        userLoading ? (
                            <CardContent className="space-y-4 animate-pulse">
                                {/* Full Name Skeleton */}
                                <div className="flex items-center space-x-3 bg-[#F9FAFB] px-4 py-3 rounded-md">
                                    <div className="h-7 w-7 bg-gray-300 rounded-full" />
                                    <div className="flex-1 space-y-2">
                                        <div className="w-24 h-3 bg-gray-300 rounded" />
                                        <div className="w-full h-5 bg-gray-200 rounded" />
                                    </div>
                                </div>

                                {/* Email Skeleton */}
                                <div className="flex items-center space-x-3 bg-[#F9FAFB] px-4 py-3 rounded-md">
                                    <div className="h-7 w-7 bg-gray-300 rounded-full" />
                                    <div className="flex-1 space-y-2">
                                        <div className="w-28 h-3 bg-gray-300 rounded" />
                                        <div className="w-full h-5 bg-gray-200 rounded" />
                                    </div>
                                </div>

                                {/* Password Skeleton */}
                                <div className="flex items-center space-x-3 bg-[#F9FAFB] px-4 py-3 rounded-md">
                                    <div className="h-7 w-7 bg-gray-300 rounded-full" />
                                    <div className="flex-1 space-y-2">
                                        <div className="w-24 h-3 bg-gray-300 rounded" />
                                        <div className="w-1/3 h-5 bg-gray-200 rounded" />
                                    </div>
                                </div>

                                {/* Save Button Skeleton */}
                                <div className="flex justify-between pt-4">
                                    <div className="w-32 h-10 bg-gray-300 rounded" />
                                </div>
                            </CardContent>
                        )
                            :
                            (
                                <CardContent className="space-y-2">
                                    {/* Full Name */}
                                    <div className="flex items-center space-x-3 bg-[#F9FAFB] px-4 py-3 rounded-md">
                                        <BiUser className="h-7 w-7 text-[#737373]" />
                                        <div className="flex-1">
                                            <p className="text-xs text-[#737373]">Full Name</p>
                                            {editingField === "fullName" ? (
                                                <div className="flex space-x-2">
                                                    <Input
                                                        value={tempValue}
                                                        onChange={(e) => setTempValue(e.target.value)}
                                                        className="flex-1 text-sm font-medium text-[#000000]"
                                                    />
                                                    <Button size="sm" onClick={() => handleSave("fullName")}>
                                                        Save
                                                    </Button>
                                                    <Button size="sm" variant="outline" onClick={handleCancel}>
                                                        Cancel
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-between">
                                                    <p className="text-sm font-medium">{userData?.fullName}</p>
                                                    <Button variant="ghost" size="icon" onClick={() => handleEdit("fullName", userData?.fullName)}>
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Email */}
                                    <div className="flex items-center space-x-3 bg-[#F9FAFB] px-4 py-3 rounded-md">
                                        <Mail className="h-7 w-7 text-[#737373]" />
                                        <div className="flex-1">
                                            <p className="text-xs text-[#737373]">Email Address</p>
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm font-medium">{userData?.email}</p>
                                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">Not editable</span>
                                            </div>
                                        </div>
                                    </div>


                                    {/* Password */}
                                    <div className="flex items-center space-x-3 bg-[#F9FAFB] px-4 py-3 rounded-md">
                                        <Lock className="h-7 w-7 text-[#737373]" />
                                        <div className="flex-1">
                                            <p className="text-sm text-[#737373]">Password</p>
                                            <div className="flex items-center justify-between">
                                                <p>{userData?.password}</p>
                                                <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
                                                    <DialogTrigger asChild>
                                                        <Button variant="secondary" size="sm">
                                                            Change
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent>
                                                        <DialogHeader>
                                                            <DialogTitle>Change Password</DialogTitle>
                                                            <DialogDescription>Enter your old and new passwords below.</DialogDescription>
                                                        </DialogHeader>
                                                        <div className="space-y-4 py-4">
                                                            <div className="space-y-2">
                                                                <p className="text-sm">Old Password</p>
                                                                <Input
                                                                    type="password"
                                                                    value={oldPassword}
                                                                    onChange={(e) => setOldPassword(e.target.value)}
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <p className="text-sm">New Password</p>
                                                                <Input
                                                                    type="password"
                                                                    value={newPassword}
                                                                    onChange={(e) => setNewPassword(e.target.value)}
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <p className="text-sm">Confirm New Password</p>
                                                                <Input
                                                                    type="password"
                                                                    value={confirmPassword}
                                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                                />
                                                            </div>
                                                        </div>
                                                        <DialogFooter>
                                                            <Button variant="outline" onClick={() => setIsPasswordDialogOpen(false)}>
                                                                Cancel
                                                            </Button>
                                                            <Button onClick={handlePasswordChange} disabled={resetPasswordMutation.isPending}>
                                                                {resetPasswordMutation.isPending ? "Updating..." : "Update Password"}
                                                            </Button>
                                                        </DialogFooter>
                                                    </DialogContent>
                                                </Dialog>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Save button */}
                                    <div className="flex justify-between pt-4">
                                        <Button
                                            className="bg-green-600 hover:bg-green-700"
                                            onClick={handleSaveChanges}
                                            disabled={updateProfileMutation.isPending}
                                        >
                                            {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                                        </Button>
                                    </div>
                                </CardContent>
                            )
                    }
                </Card>

                <div>
                    <FeedbackCard />
                </div>
            </div>

            <div className="lg:col-span-2 mt-5 md:mt-0">
                <SubscriptionCard />
            </div>
        </div>
    )
}