"use client"
import Link from "next/link"
import PathTracker from "../_components/PathTracker"

import { useState } from "react"
import { Pencil, Trash2 } from "lucide-react"
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import useAxios from "@/hooks/useAxios"

interface Influencer {
  _id: string
  fullName: string
  email: string
  phoneNumber: string
  role: string
  address: string
  followers: number
  profilePhoto?: string
  createdAt: string
  updatedAt: string
  __v: number
}

interface ApiResponse {
  status: boolean
  message: string
  data: Influencer[]
  meta: {
    total: number
    limit: number
    page: number
    pages: number
  }
}

const Page = () => {
  const [currentPage, setCurrentPage] = useState(1)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [selectedInfluencer, setSelectedInfluencer] = useState<Influencer | null>(null)
  const [editForm, setEditForm] = useState({
    id: "",
    fullName: "",
    email: "",
    phoneNumber: "",
    address: "",
    followers: 0,
  })

  const axiosInstance = useAxios()
  const queryClient = useQueryClient()

  const {
    data: apiResponse,
    isLoading,
    error,
  } = useQuery<ApiResponse>({
    queryKey: ["influencers", currentPage],
    queryFn: async () => {
      const response = await axiosInstance(`/admin/influencer/get-all-influencer?page=${currentPage}&limit=10`)
      return response.data
    },
  })

  // Update influencer mutation
  const updateInfluencerMutation = useMutation({
    mutationFn: async (data: { id: string; updateData: Partial<Influencer> }) => {
      const response = await axiosInstance.post(`/user/update-user`, data.updateData)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["influencers"] })
      setEditModalOpen(false)
      setSelectedInfluencer(null)
    },
  })

  // Delete influencer mutation
  const deleteInfluencerMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await axiosInstance.delete(`/admin/influencer/delete-influencer/${id}`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["influencers"] })
      setDeleteModalOpen(false)
      setSelectedInfluencer(null)
    },
  })

  const handleEdit = (influencer: Influencer) => {
    setSelectedInfluencer(influencer)
    setEditForm({
      id : influencer._id,
      fullName: influencer.fullName,
      email: influencer.email,
      phoneNumber: influencer.phoneNumber,
      address: influencer.address,
      followers: influencer.followers,
    })
    setEditModalOpen(true)
  }

  const handleDelete = (influencer: Influencer) => {
    setSelectedInfluencer(influencer)
    setDeleteModalOpen(true)
  }

  const handleEditSubmit = () => {
    if (selectedInfluencer) {
      updateInfluencerMutation.mutate({
        id: selectedInfluencer._id,
        updateData: editForm,
      })
    }
  }

  const handleDeleteConfirm = () => {
    if (selectedInfluencer) {
      deleteInfluencerMutation.mutate(selectedInfluencer._id)
    }
  }

  const influencers = apiResponse?.data || []
  const meta = apiResponse?.meta

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading influencers...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-500">Error loading influencers</div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <PathTracker />
        <Link href={"/dashboard/influencers/add-influencers"}>
          <button className="bg-[#28a745] py-2 px-5 rounded-lg text-white font-semibold">+ Add Influencers</button>
        </Link>
      </div>

      <div>
        <div className="rounded-lg overflow-hidden border border-[#b0b0b0]">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-[#b0b0b0]">
                <TableHead className="text-center font-medium">Name</TableHead>
                <TableHead className="text-center font-medium">Phone</TableHead>
                <TableHead className="text-center font-medium">Email</TableHead>
                <TableHead className="text-center font-medium">Followers</TableHead>
                <TableHead className="text-right font-medium">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {influencers.map((influencer) => (
                <TableRow key={influencer._id} className="border-b border-[#b0b0b0]">
                  <TableCell className="flex items-center gap-3 py-4 border-none">
                    <Avatar className="h-12 w-12 border border-gray-200">
                      <AvatarImage src={`${influencer?.profilePhoto}`} alt={influencer.fullName} />
                    </Avatar>
                    <span className="font-medium">{influencer.fullName}</span>
                  </TableCell>
                  <TableCell className="border-none">{influencer.phoneNumber}</TableCell>
                  <TableCell className="border-none">{influencer.email}</TableCell>
                  <TableCell className="border-none">{influencer.followers}</TableCell>
                  <TableCell className="border-none">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-500"
                        onClick={() => handleEdit(influencer)}
                      >
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-500"
                        onClick={() => handleDelete(influencer)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {meta && (
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

              {Array.from({ length: Math.min(5, meta.pages) }, (_, i) => {
                const pageNumber = i + 1
                return (
                  <Button
                    key={i}
                    variant={currentPage === pageNumber ? "default" : "outline"}
                    size="icon"
                    className={`h-8 w-8 ${
                      currentPage === pageNumber ? "bg-green-500 border-green-500 hover:bg-green-600" : ""
                    }`}
                    onClick={() => setCurrentPage(pageNumber)}
                  >
                    {pageNumber}
                  </Button>
                )
              })}

              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === meta.pages}
              >
                &gt;
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Influencer</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="userName">Username</Label>
              <Input
                id="fullName"
                value={editForm.fullName}
                onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                value={editForm.phoneNumber}
                onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={editForm.address}
                onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="followers">Followers</Label>
              <Input
                id="followers"
                type="number"
                value={editForm.followers}
                onChange={(e) => setEditForm({ ...editForm, followers: Number.parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleEditSubmit}
              disabled={updateInfluencerMutation.isPending}
              className="bg-[#28a745] hover:bg-[#218838]"
            >
              {updateInfluencerMutation.isPending ? "Updating..." : "Update"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Modal */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Influencer</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>
              Are you sure you want to delete <strong>{selectedInfluencer?.fullName}</strong>? This action cannot be
              undone.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm} disabled={deleteInfluencerMutation.isPending}>
              {deleteInfluencerMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Page
