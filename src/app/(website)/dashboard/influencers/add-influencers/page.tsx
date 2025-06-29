"use client"
import type React from "react"

import { useRouter } from "next/navigation"
import { useState, useRef } from "react"
import Image from "next/image"
import { Upload } from "lucide-react"
import useAxios from "@/hooks/useAxios"
import { useMutation } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import PathTracker from "../../_components/PathTracker"

interface FormData {
  fullName: string
  phoneNumber: string
  email: string
  address: string
}

const Page = () => {
  const router = useRouter()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      fullName: "",
      phoneNumber: "",
      email: "",
      address: "",
    },
  })

  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLFormElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleFile = (file: File) => {
    // Check if file is jpeg or png
    if (!file.type.match("image/jpeg") && !file.type.match("image/png")) {
      toast.error("Only JPEG and PNG files are allowed")
      return
    }

    // Store the actual file for FormData
    setSelectedFile(file)

    // Create preview URL for display
    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target?.result) {
        const imageDataUrl = e.target.result as string
        setUploadedImage(imageDataUrl)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleBrowseClick = () => {
    fileInputRef.current?.click()
  }

  const axiosInstance = useAxios()

  const { mutateAsync } = useMutation({
    mutationKey: ["add-influencer"],
    mutationFn: async (formData: globalThis.FormData) => {
      const res = await axiosInstance.post("/admin/influencer/create", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      return res.data
    },
    onSuccess: () => {
      toast.success("Influencer added successfully!")
      router.push("/dashboard/influencers")
    },
    onError: (error) => {
      console.error("Upload error:", error)
      toast.error("Failed to add influencer")
    },
  })

  const onSubmit = async (data: FormData) => {
    try {
      // Create FormData object
      const formData = new FormData()

      // Append form fields
      formData.append("fullName", data.fullName)
      formData.append("phoneNumber", data.phoneNumber)
      formData.append("email", data.email)
      formData.append("address", data.address)
      formData.append("role", "influencer")
      formData.append("followers", "0")
      formData.append("password", "123456")

      // Append image file if selected
      if (selectedFile) {
        formData.append("imageLink", selectedFile);
      }

      await mutateAsync(formData)
    } catch (error) {
      console.error("Submission error:", error)
    }
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <PathTracker />

        <button
          onClick={() => formRef.current?.requestSubmit()}
          disabled={isSubmitting}
          className="px-6 py-2 bg-[#28a745] text-white rounded-md hover:bg-[#218838] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Adding..." : "Add Influencer"}
        </button>
      </div>

      <div>
        <div className="border border-[#b0b0b0] rounded-lg p-4">
          <form ref={formRef} onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-5">
              <div>
                <label htmlFor="userName" className="block text-gray-700 mb-2">
                  Influencers Name
                </label>
                <input
                  type="text"
                  id="fullName"
                  {...register("fullName", { required: "Name is required" })}
                  className="w-full p-3 outline-none rounded-md bg-inherit border border-[#b0b0b0]"
                  placeholder="Enter Influencer Name"
                />
                {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName.message}</p>}
              </div>

              <div>
                <label htmlFor="phoneNumber" className="block text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phoneNumber"
                  {...register("phoneNumber", {
                    required: "Phone number is required",
                  })}
                  className="w-full p-3 outline-none rounded-md bg-inherit border border-[#b0b0b0]"
                  placeholder="Enter Phone Number"
                />
                {errors.phoneNumber && <p className="text-red-500 text-sm mt-1">{errors.phoneNumber.message}</p>}
              </div>

              <div>
                <label htmlFor="email" className="block text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^\S+@\S+$/i,
                      message: "Invalid email address",
                    },
                  })}
                  className="w-full p-3 outline-none rounded-md bg-inherit border border-[#b0b0b0]"
                  placeholder="Enter Email Address"
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
              </div>

              <div>
                <label htmlFor="address" className="block text-gray-700 mb-2">
                  Address
                </label>
                <input
                  type="text"
                  id="address"
                  {...register("address", { required: "Address is required" })}
                  className="w-full p-3 outline-none rounded-md bg-inherit border border-[#b0b0b0]"
                  placeholder="Address"
                />
                {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>}
              </div>
            </div>

            <div>
              <h2 className="text-gray-700 mb-4">Blog Gallery</h2>
              <div
                className={`lg:h-[90%] border-2 border-dashed rounded-md flex flex-col items-center justify-center cursor-pointer ${
                  isDragging ? "border-gray-500 bg-gray-50" : "border-gray-300"
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={handleBrowseClick}
              >
                {uploadedImage ? (
                  <div className="relative w-full h-full">
                    <Image
                      src={uploadedImage || "/placeholder.svg"}
                      alt="Uploaded image"
                      fill
                      className="object-contain p-2"
                    />
                  </div>
                ) : (
                  <>
                    <Upload className="w-12 h-12 text-gray-400 mb-2" />
                    <p className="text-gray-500 text-center">Drop your image here, or browse</p>
                    <p className="text-gray-400 text-sm mt-1">Jpeg, png are allowed</p>
                  </>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/jpeg,image/png"
                  className="hidden"
                />
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Page
