"use client"
import PathTracker from "../_components/PathTracker"

import { Pencil, Trash2, X } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { useState } from "react"
import Link from "next/link"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import useAxios from "@/hooks/useAxios"
import { useForm } from "react-hook-form"
import {toast} from "sonner"

interface Video {
  _id: string
  videoTitle: string
  videoLink: string
  publish: boolean
  createdAt: string
  updatedAt: string
}

interface ApiResponse {
  status: boolean
  message: string
  data: Video[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

interface EditFormData {
  videoTitle: string
  videoLink: string
}

const Page = () => {
  const axiosInstance = useAxios()
  const queryClient = useQueryClient()

  // State for modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null)

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)

  // Form for editing
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = useForm<EditFormData>()

  // Fetch videos
  const {
    data: apiResponse,
    isLoading,
    error,
  } = useQuery<ApiResponse>({
    queryKey: ["youtubeVideos", currentPage],
    queryFn: async () => {
      const res = await axiosInstance.get(`/admin/youtubeVideos/get-all-videos?page=${currentPage}`)
      return res.data
    },
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (videoId: string) => {
      const response = await axiosInstance.delete(`/admin/youtubeVideos/delete-video/${videoId}`)
      return response.data
    },
    onSuccess: () => {
      toast.success("Video deleted successfully!")
      queryClient.invalidateQueries({ queryKey: ["youtubeVideos"] })
      setIsDeleteModalOpen(false)
      setSelectedVideo(null)
    },
    onError: () => {
      const errorMessage = "Failed to delete video"
      toast.error(errorMessage)
    },
  })

  // Edit mutation
  const editMutation = useMutation({
    mutationFn: async ({ videoId, data }: { videoId: string; data: EditFormData }) => {
      const response = await axiosInstance.patch(`/admin/youtubeVideos/update-video/${videoId}`, data)
      return response.data
    },
    onSuccess: () => {
      toast.success("Video updated successfully!")
      queryClient.invalidateQueries({ queryKey: ["youtubeVideos"] })
      setIsEditModalOpen(false)
      setSelectedVideo(null)
      reset()
    },
    onError: () => {
      const errorMessage = "Failed to update video"
      toast.error(errorMessage)
    },
  })

  // Publish status mutation
  const publishMutation = useMutation({
    mutationFn: async ({ videoId, publish }: { videoId: string; publish: boolean }) => {
      const response = await axiosInstance.patch(`/admin/youtubeVideos/change-status/${videoId}`, {
        publish,
      })
      return response.data
    },
    onSuccess: (data, variables) => {
      toast.success(`Video ${variables.publish ? "published" : "unpublished"} successfully!`)
      // Invalidate and refetch the current page
      queryClient.invalidateQueries({
        queryKey: ["youtubeVideos", currentPage],
        exact: true,
      })
      // Also invalidate all youtube videos queries to ensure consistency
      queryClient.invalidateQueries({
        queryKey: ["youtubeVideos"],
      })
    },
    onError: () => {
      const errorMessage = "Failed to update video status"
      toast.error(errorMessage)
    },
  })

  // Toggle published status - improved version
  const togglePublished = async (video: Video) => {
    // Prevent multiple clicks while mutation is pending
    if (publishMutation.isPending) {
      return
    }

    const newStatus = !video.publish

    try {
      await publishMutation.mutateAsync({
        videoId: video._id,
        publish: newStatus,
      })
    } catch (error) {
      // Error is already handled in the mutation onError
      console.error("Toggle publish error:", error)
    }
  }

  // Handle edit button click
  const handleEditClick = (video: Video) => {
    setSelectedVideo(video)
    setValue("videoTitle", video.videoTitle)
    setValue("videoLink", video.videoLink)
    setIsEditModalOpen(true)
  }

  // Handle delete button click
  const handleDeleteClick = (video: Video) => {
    setSelectedVideo(video)
    setIsDeleteModalOpen(true)
  }

  // Handle edit form submission
  const handleEditSubmit = async (data: EditFormData) => {
    if (!selectedVideo) return

    try {
      await editMutation.mutateAsync({
        videoId: selectedVideo._id,
        data,
      })
    } catch (error) {
      // Error is handled in the mutation
      console.log(error)
    }
  }

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!selectedVideo) return

    try {
      await deleteMutation.mutateAsync(selectedVideo._id)
    } catch (error) {
      // Error is handled in the mutation
      console.log(error)
    }
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const videos = apiResponse?.data || []
  const meta = apiResponse?.meta

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading videos...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-500">Error loading videos</div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <PathTracker />

        <Link href={"/dashboard/youtube-video/add-video"}>
          <button className="bg-[#28a745] py-2 px-5 rounded-lg text-white font-semibold hover:bg-[#218838] transition-colors">
            + Add Video
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
              {videos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                    No videos found
                  </TableCell>
                </TableRow>
              ) : (
                videos.map((video) => (
                  <TableRow key={video._id} className="border-b border-[#b0b0b0]">
                    <TableCell className="border-none">
                      <div className="max-w-xs truncate" title={video.videoTitle}>
                        {video.videoTitle}
                      </div>
                    </TableCell>
                    <TableCell className="text-center border-none">
                      <div className="flex justify-center items-center">
                        <Switch
                          checked={video.publish}
                          onCheckedChange={() => togglePublished(video)}
                          disabled={publishMutation.isPending}
                          className="data-[state=checked]:bg-green-500 disabled:opacity-50"
                        />
                        {publishMutation.isPending && (
                          <div className="ml-2 w-4 h-4 border-2 border-gray-300 border-t-green-500 rounded-full animate-spin"></div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center border-none">{formatDate(video.createdAt)}</TableCell>
                    <TableCell>
                      <div className="flex justify-center space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditClick(video)}
                          className="hover:bg-blue-50 hover:text-blue-600"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteClick(video)}
                          className="hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 text-sm">
            <div>
              Showing {(meta.page - 1) * meta.limit + 1}-{Math.min(meta.page * meta.limit, meta.total)} from{" "}
              {meta.total}
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

              {Array.from({ length: Math.min(5, meta.totalPages) }, (_, i) => {
                const pageNumber = i + 1
                return (
                  <Button
                    key={i}
                    variant={currentPage === pageNumber ? "default" : "outline"}
                    size="icon"
                    className={`h-8 w-8 ${currentPage === pageNumber ? "bg-green-500 hover:bg-green-600" : ""}`}
                    onClick={() => setCurrentPage(pageNumber)}
                  >
                    {pageNumber}
                  </Button>
                )
              })}

              {meta.totalPages > 5 && (
                <>
                  <Button variant="outline" size="icon" className="h-8 w-8" disabled>
                    ...
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setCurrentPage(meta.totalPages)}
                  >
                    {meta.totalPages}
                  </Button>
                </>
              )}

              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === meta.totalPages}
              >
                &gt;
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Edit Video</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setIsEditModalOpen(false)
                  setSelectedVideo(null)
                  reset()
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <form onSubmit={handleSubmit(handleEditSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Video Title</label>
                <input
                  type="text"
                  {...register("videoTitle")}
                  className={`w-full h-10 border rounded-lg px-3 outline-none focus:ring-2 focus:ring-[#28a745] focus:border-transparent transition-all ${
                    errors.videoTitle ? "border-red-500 focus:ring-red-500" : "border-[#b0b0b0]"
                  }`}
                  placeholder="Enter video title"
                />
                {errors.videoTitle && <p className="text-red-500 text-sm mt-1">{errors.videoTitle.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Video Link</label>
                <input
                  type="url"
                  {...register("videoLink")}
                  className={`w-full h-10 border rounded-lg px-3 outline-none focus:ring-2 focus:ring-[#28a745] focus:border-transparent transition-all ${
                    errors.videoLink ? "border-red-500 focus:ring-red-500" : "border-[#b0b0b0]"
                  }`}
                  placeholder="Enter YouTube video link"
                />
                {errors.videoLink && <p className="text-red-500 text-sm mt-1">{errors.videoLink.message}</p>}
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={isSubmitting || editMutation.isPending}
                  className="flex-1 bg-[#28a745] hover:bg-[#218838] text-white"
                >
                  {isSubmitting || editMutation.isPending ? "Updating..." : "Update Video"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditModalOpen(false)
                    setSelectedVideo(null)
                    reset()
                  }}
                  disabled={isSubmitting || editMutation.isPending}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && selectedVideo && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-red-600">Delete Video</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setIsDeleteModalOpen(false)
                  setSelectedVideo(null)
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="mb-6">
              <p className="text-gray-600 mb-2">Are you sure you want to delete this video?</p>
              <p className="font-medium text-gray-800">{selectedVideo.videoTitle}</p>
              <p className="text-sm text-red-500 mt-2">This action cannot be undone.</p>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleDeleteConfirm}
                disabled={deleteMutation.isPending}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                {deleteMutation.isPending ? "Deleting..." : "Delete"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsDeleteModalOpen(false)
                  setSelectedVideo(null)
                }}
                disabled={deleteMutation.isPending}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Page
