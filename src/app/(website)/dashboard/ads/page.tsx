"use client";
import PathTracker from "../_components/PathTracker";
import type React from "react";

import { Pencil, Trash2, X } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import Link from "next/link";
import useAxios from "@/hooks/useAxios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface Ad {
  _id: string;
  adsTitle: string;
  adsContent: string;
  imageLink?: string;
  publish: boolean;
  views: number;
  createdAt: string;
  updatedAt: string;
}

interface ads {
  _id: string;
  publish: boolean;
  createdAt: string;
  updatedAt: string;
}

interface EditFormData {
  imageLink: string;
  adsTitle: string;
  adsContent: string;
}

const Page = () => {
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedAd, setSelectedAd] = useState<Ad | null>(null);
  const [editFormData, setEditFormData] = useState<EditFormData>({
    imageLink: "",
    adsTitle: "",
    adsContent: "",
  });

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [adToDelete, setAdToDelete] = useState<Ad | null>(null);

  const postsPerPage = 10;
  const axiosInstance = useAxios();
  const queryClient = useQueryClient();

  const { data: adsResponse, isLoading } = useQuery({
    queryKey: ["ads"],
    queryFn: async () => {
      const response = await axiosInstance.get("/admin/ads/all-ads");
      return response.data;
    },
  });

  const ads = adsResponse?.data || [];
  const totalPages = Math.ceil(ads.length / postsPerPage);

  // Get current ads
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentAds = ads.slice(indexOfFirstPost, indexOfLastPost);

  // Edit mutation
  const editMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: EditFormData }) => {
      const response = await axiosInstance.patch(`/admin/ads/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ads"] });
      setIsEditModalOpen(false);
      setSelectedAd(null);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await axiosInstance.delete(`/admin/ads/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ads"] });
    },
  });

  const handleEdit = (ad: Ad) => {
    setSelectedAd(ad);
    setEditFormData({
      imageLink: ad.imageLink || "",
      adsTitle: ad.adsTitle,
      adsContent: ad.adsContent,
    });
    setIsEditModalOpen(true);
  };

  const handleDelete = (ad: Ad) => {
    setAdToDelete(ad);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (adToDelete) {
      deleteMutation.mutate(adToDelete._id);
      setIsDeleteModalOpen(false);
      setAdToDelete(null);
    }
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedAd) {
      editMutation.mutate({
        id: selectedAd._id,
        data: editFormData,
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Publish status mutation
  const publishMutation = useMutation({
    mutationFn: async ({
      videoId,
      publish,
    }: {
      videoId: string;
      publish: boolean;
    }) => {
      const response = await axiosInstance.post(
        `/admin/ads/update-ads-status/${videoId}`,
        {
          publish,
        }
      );
      return response.data;
    },
    onSuccess: (data, variables) => {
      toast.success(
        `Video ${variables.publish ? "published" : "unpublished"} successfully!`
      );
      // Invalidate and refetch the current page
      queryClient.invalidateQueries({
        queryKey: ["ads", currentPage],
        exact: true,
      });
      // Also invalidate all youtube videos queries to ensure consistency
      queryClient.invalidateQueries({
        queryKey: ["ads"],
      });
    },
    onError: () => {
      const errorMessage = "Failed to update video status";
      toast.error(errorMessage);
    },
  });

  // Toggle published status - improved version
  const togglePublished = async (ad : ads) => {
    // Prevent multiple clicks while mutation is pending
    if (publishMutation.isPending) {
      return;
    }

    const newStatus = !ad.publish;

    try {
      await publishMutation.mutateAsync({
        videoId: ad._id,
        publish: newStatus,
      });
    } catch (error) {
      // Error is already handled in the mutation onError
      console.error("Toggle publish error:", error);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <PathTracker />

        <Link href={"/dashboard/ads/add-ads"}>
          <button className="bg-[#28a745] py-2 px-5 rounded-lg text-white font-semibold">
            + Add Ads
          </button>
        </Link>
      </div>

      <div>
        <div className="rounded-lg overflow-hidden border border-[#b0b0b0]">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-[#b0b0b0]">
                <TableHead className="text-center">Title</TableHead>
                <TableHead className="text-center">Published</TableHead>
                <TableHead className="text-center">Date</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentAds.map((ad: Ad) => (
                <TableRow key={ad._id} className="border-b border-[#b0b0b0]">
                  <TableCell className="border-none">{ad.adsTitle}</TableCell>
                  <TableCell className="text-center border-none">
                    <div className="flex justify-center items-center">
                      <Switch
                        checked={ad.publish}
                        onCheckedChange={() => togglePublished(ad)}
                        disabled={publishMutation.isPending}
                        className="data-[state=checked]:bg-green-500 disabled:opacity-50"
                      />
                      {publishMutation.isPending && (
                        <div className="ml-2 w-4 h-4 border-2 border-gray-300 border-t-green-500 rounded-full animate-spin"></div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-center border-none">
                    {formatDate(ad.createdAt)}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(ad)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(ad)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4 text-sm">
          <div>
            Showing {indexOfFirstPost + 1}-
            {Math.min(indexOfLastPost, ads.length)} from {ads.length}
          </div>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              &lt;
            </Button>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNumber = i + 1;
              return (
                <Button
                  key={i}
                  variant={currentPage === pageNumber ? "default" : "outline"}
                  size="icon"
                  className={`h-8 w-8 ${
                    currentPage === pageNumber ? "bg-green-500" : ""
                  }`}
                  onClick={() => setCurrentPage(pageNumber)}
                >
                  {pageNumber}
                </Button>
              );
            })}

            {totalPages > 5 && (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  disabled
                >
                  ...
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setCurrentPage(totalPages)}
                >
                  {totalPages}
                </Button>
              </>
            )}

            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              &gt;
            </Button>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Edit Ad</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsEditModalOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <Label htmlFor="adsTitle">Ad Title</Label>
                <Input
                  id="adsTitle"
                  value={editFormData.adsTitle}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      adsTitle: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div>
                <Label htmlFor="adsContent">Ad Content</Label>
                <Textarea
                  id="adsContent"
                  value={editFormData.adsContent}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      adsContent: e.target.value,
                    })
                  }
                  required
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="imageLink">Image Link</Label>
                <Input
                  id="imageLink"
                  value={editFormData.imageLink}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      imageLink: e.target.value,
                    })
                  }
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={editMutation.isPending}
                  className="flex-1 bg-[#28a745] hover:bg-[#218838]"
                >
                  {editMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Delete Ad</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="mb-6">
              <p className="text-gray-600">
                Are you sure you want to delete {adToDelete?.adsTitle}? This
                action cannot be undone.
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={confirmDelete}
                disabled={deleteMutation.isPending}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                {deleteMutation.isPending ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Page;
