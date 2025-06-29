"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { EditProfileModal } from "./_components/edit-profile-modal";
import { EditPasswordModal } from "./_components/edit-password-modal";
import PathTracker from "../_components/PathTracker";
import { useSession } from "next-auth/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAxios from "@/hooks/useAxios";
import { toast } from "@/hooks/use-toast";

interface UserData {
  _id: string;
  fullName: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  bio?: string;
  role: string;
  followers: number;
  refferCount: number;
  createdAt: string;
  updatedAt: string;
}

export default function ProfilePage() {
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const session = useSession();
  const userID = session?.data?.user?.id;
  const axiosInstance = useAxios();
  const queryClient = useQueryClient();

  const { data: userData = {} as UserData, isLoading } = useQuery({
    queryKey: ["single-user", userID],
    queryFn: async () => {
      const res = await axiosInstance(`/user/get-user/${userID}`);
      return res.data.data;
    },
    enabled: !!userID,
  });

  const updateUserMutation = useMutation({
    mutationFn: async (updateData: Partial<UserData>) => {
      const res = await axiosInstance.post("/user/update-user", updateData);
      return res.data;
    },
    onSuccess: (data) => {
      // Update the cached data
      queryClient.setQueryData(["single-user", userID], data.data);
      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });
      setIsProfileModalOpen(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  const handleProfileUpdate = (newData: Partial<UserData>) => {
    updateUserMutation.mutate(newData);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div>
        <PathTracker />
      </div>

      <div className="py-10 space-y-8">
        <div className="border border-[#b0b0b0] rounded-lg bg-inherit">
          <Card className="bg-inherit">
            <CardContent className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative h-16 w-16 overflow-hidden rounded-full border-2 border-green-100">
                  <Image
                    src="/placeholder.svg?height=100&width=100"
                    alt="Profile picture"
                    width={100}
                    height={100}
                    className="object-cover border border-gray-500"
                  />
                </div>
                <div>
                  <h2 className="text-xl font-bold">{userData?.userName}</h2>
                  <p className="text-gray-500">{userData?.email}</p>
                </div>
              </div>
              <Button
                onClick={() => setIsProfileModalOpen(true)}
                className="bg-green-500 hover:bg-green-600"
                disabled={updateUserMutation.isPending}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-2"
                >
                  <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path>
                  <path d="m15 5 4 4"></path>
                </svg>
                Edit
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-inherit">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <h3 className="text-xl font-bold">Personal Information</h3>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Full Name
                  </label>
                  <Input
                    value={userData?.fullName || "Not provided"}
                    readOnly
                    className="bg-gray-50 bg-inherit border border-[#b0b0b0] read-only:cursor-not-allowed"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Email Address
                  </label>
                  <Input
                    value={userData?.email || ""}
                    readOnly
                    className="bg-gray-50 bg-inherit border border-[#b0b0b0] read-only:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Phone
                  </label>
                  <Input
                    value={userData?.phoneNumber || "Not provided"}
                    readOnly
                    className="bg-gray-50 bg-inherit border border-[#b0b0b0] read-only:cursor-not-allowed"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Address
                </label>
                <Input
                  value={userData?.address || "Not provided"}
                  readOnly
                  className="bg-gray-50 bg-inherit border border-[#b0b0b0] read-only:cursor-not-allowed"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border border-[#b0b0b0] bg-inherit">
          <CardHeader className="pb-2">
            <h3 className="text-xl font-bold">Change password</h3>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">
                Current Password
              </label>
              <Input
                type="password"
                value="############"
                className="bg-gray-50 bg-inherit border border-[#b0b0b0] read-only:cursor-not-allowed"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  New Password
                </label>
                <Input
                  type="password"
                  value="############"
                  readOnly
                  className="bg-gray-50 bg-inherit border border-[#b0b0b0] read-only:cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Confirm New Password
                </label>
                <Input
                  type="password"
                  value="############"
                  readOnly
                  className="bg-gray-50 bg-inherit border border-[#b0b0b0] read-only:cursor-not-allowed"
                />
              </div>
            </div>
            <div>
              <Button
                onClick={() => setIsPasswordModalOpen(true)}
                className="bg-green-500 hover:bg-green-600"
              >
                Change Password
              </Button>
            </div>
          </CardContent>
        </Card>

        <EditProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          profileData={userData}
          onUpdate={handleProfileUpdate}
          isLoading={updateUserMutation.isPending}
        />

        <EditPasswordModal
          isOpen={isPasswordModalOpen}
          onClose={() => setIsPasswordModalOpen(false)}
        />
      </div>
    </div>
  );
}
