"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { motion, AnimatePresence } from "framer-motion"
import { Loader2 } from "lucide-react"

interface ProfileData {
  _id?: string
  firstName?: string
  lastName?: string
  userName?: string
  email?: string
  phone?: string
  bio?: string
}

interface EditProfileModalProps {
  isOpen: boolean
  onClose: () => void
  profileData: ProfileData
  onUpdate: (data: Partial<ProfileData>) => void
  personalInfoOnly?: boolean
  isLoading?: boolean
}

export function EditProfileModal({
  isOpen,
  onClose,
  profileData,
  onUpdate,
  personalInfoOnly = false,
  isLoading = false,
}: EditProfileModalProps) {
  const [formData, setFormData] = useState<ProfileData>({
    firstName: "",
    lastName: "",
    userName: "",
    email: "",
    phone: "",
    bio: "",
  })

  // Update form data when profileData changes
  useEffect(() => {
    if (profileData) {
      setFormData({
        firstName: profileData.firstName || "",
        lastName: profileData.lastName || "",
        userName: profileData.userName || "",
        email: profileData.email || "",
        phone: profileData.phone || "",
        bio: profileData.bio || "",
      })
    }
  }, [profileData])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Only send changed fields
    const changedData: Partial<ProfileData> = {}

    if (formData.firstName !== profileData.firstName) {
      changedData.firstName = formData.firstName
    }
    if (formData.lastName !== profileData.lastName) {
      changedData.lastName = formData.lastName
    }
    if (formData.userName !== profileData.userName) {
      changedData.userName = formData.userName
    }
    if (formData.email !== profileData.email) {
      changedData.email = formData.email
    }
    if (formData.phone !== profileData.phone) {
      changedData.phone = formData.phone
    }
    if (formData.bio !== profileData.bio) {
      changedData.bio = formData.bio
    }

    // Only update if there are changes
    if (Object.keys(changedData).length > 0) {
      onUpdate(changedData)
    } else {
      onClose()
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      onClose()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={handleClose}>
          <DialogContent className="sm:max-w-[525px]">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.2 }}
            >
              <DialogHeader>
                <DialogTitle className="text-xl">
                  {personalInfoOnly ? "Edit Personal Information" : "Edit Profile"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6 py-4">
                {!personalInfoOnly && (
                  <div className="flex items-center gap-4">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src="/placeholder.svg?height=100&width=100" alt="Profile picture" />
                      <AvatarFallback>
                        {formData?.firstName?.charAt(0) || "U"}
                        {formData?.lastName?.charAt(0) || ""}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <Button type="button" variant="outline" size="sm" className="mb-2" disabled={isLoading}>
                        Change Photo
                      </Button>
                      <p className="text-xs text-muted-foreground">JPG, GIF or PNG. 1MB max.</p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="Enter first name"
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Enter last name"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {!personalInfoOnly && (
                  <div className="space-y-2">
                    <Label htmlFor="userName">Username</Label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground">
                        @
                      </span>
                      <Input
                        id="userName"
                        name="userName"
                        value={formData.userName}
                        onChange={handleChange}
                        className="rounded-l-none"
                        placeholder="username"
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter email address"
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Enter phone number"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Tell us about yourself..."
                    disabled={isLoading}
                  />
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-green-500 hover:bg-green-600" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </motion.div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  )
}
