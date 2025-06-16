"use client"

import type React from "react"

import { useState } from "react"
import { Upload, X } from "lucide-react"
import Image from "next/image"
import useAxios from "@/hooks/useAxios"
import { useMutation } from "@tanstack/react-query"
import { useForm, Controller } from "react-hook-form"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"

// Dynamically import Quill to avoid SSR issues
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false })
import "react-quill/dist/quill.snow.css"
import PathTracker from "../../_components/PathTracker"

interface AdsFormData {
  adsTitle: string
  adsContent: string
}

const Page = () => {
  const router = useRouter()
  const [images, setImages] = useState<{ file: File; preview: string }[]>([])

  const axiosInstance = useAxios()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    control,
  } = useForm<AdsFormData>()

  // Quill modules configuration
  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ color: [] }, { background: [] }],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ indent: "-1" }, { indent: "+1" }],
      [{ align: [] }],
      ["link", "image"],
      ["blockquote", "code-block"],
      ["clean"],
    ],
  }

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "color",
    "background",
    "list",
    "bullet",
    "indent",
    "align",
    "link",
    "image",
    "blockquote",
    "code-block",
  ]

  const { mutateAsync } = useMutation({
    mutationKey: ["add-ads"],
    mutationFn: async (data: FormData) => {
      const response = await axiosInstance.post("/admin/ads/create-ads", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      return response.data
    },
    onSuccess: () => {
      toast.success("Ad created successfully!")
      reset()
      // Clear images and revoke URLs
      images.forEach((image) => URL.revokeObjectURL(image.preview))
      setImages([])
      router.push("/dashboard/ads")
    },
    onError: (error: import("axios").AxiosError) => {
      const errorMessage =
        (error.response?.data as { message?: string })?.message || "Failed to create ad. Please try again."
      toast.error(errorMessage)
    },
  })

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newImages = Array.from(e.target.files)
        .map((file) => {
          // Validate file size (max 5MB)
          if (file.size > 5 * 1024 * 1024) {
            toast.error(`Image ${file.name} is larger than 5MB`)
            return null
          }

          // Validate file type
          if (!file.type.startsWith("image/")) {
            toast.error(`File ${file.name} is not a valid image`)
            return null
          }

          return {
            file,
            preview: URL.createObjectURL(file),
          }
        })
        .filter(Boolean) as { file: File; preview: string }[]

      if (newImages.length > 0) {
        setImages([...images, ...newImages])
      }
    }
  }

  const removeImage = (index: number) => {
    const updatedImages = [...images]
    // Revoke the object URL to avoid memory leaks
    URL.revokeObjectURL(updatedImages[index].preview)
    updatedImages.splice(index, 1)
    setImages(updatedImages)
  }

  // Custom validation for Quill content
  const validateQuillContent = (value: string) => {
    // Remove HTML tags to check actual text content
    const textContent = value.replace(/<[^>]*>/g, "").trim()
    if (!textContent) {
      return "Ads description is required"
    }
    if (textContent.length < 10) {
      return "Description must be at least 10 characters long"
    }
    if (textContent.length > 1000) {
      return "Description must be less than 1000 characters"
    }
    return true
  }

  const handleSave = async (data: AdsFormData) => {
    try {
      // Validate that at least one image is uploaded
      if (images.length === 0) {
        toast.error("Please upload at least one image for the ad")
        return
      }

      // Show loading toast
      const loadingToast = toast.loading("Creating ad...")

      // Create FormData object
      const formData = new FormData()
      formData.append("adsTitle", data.adsTitle)
      formData.append("adsContent", data.adsContent)

      // Append all images
      images.forEach((image) => {
        formData.append("imageLink", image.file)
      })

      // Submit the form
      await mutateAsync(formData)

      // Dismiss loading toast
      toast.dismiss(loadingToast)

      // Reset file input
      const fileInput = document.getElementById("file-upload") as HTMLInputElement
      if (fileInput) {
        fileInput.value = ""
      }
    } catch (error) {
      // Dismiss loading toast
      toast.dismiss()
      console.error("Error creating ad:", error)
    }
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <PathTracker />

        <button
          onClick={handleSubmit(handleSave)}
          disabled={isSubmitting}
          className="bg-[#28a745] py-2 px-5 rounded-lg text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#218838] transition-colors"
        >
          {isSubmitting ? "Saving..." : "Save"}
        </button>
      </div>

      <div>
        <div className="border border-[#b0b0b0] p-4 rounded-lg">
          <div>
            <form onSubmit={handleSubmit(handleSave)} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="adsTitle" className="text-sm font-medium text-gray-700">
                  Ads Title *
                </label>
                <input
                  id="adsTitle"
                  {...register("adsTitle", {
                    required: "Ads title is required",
                    minLength: {
                      value: 3,
                      message: "Title must be at least 3 characters long",
                    },
                    maxLength: {
                      value: 100,
                      message: "Title must not exceed 100 characters",
                    },
                  })}
                  placeholder="Enter Ads Title"
                  className={`border p-4 rounded-lg bg-inherit outline-none w-full focus:ring-2 focus:ring-[#28a745] focus:border-transparent transition-all ${
                    errors.adsTitle ? "border-red-500 focus:ring-red-500" : "border-[#b0b0b0]"
                  }`}
                />
                {errors.adsTitle && <p className="text-red-500 text-sm mt-1">{errors.adsTitle.message}</p>}
              </div>

              <div className="space-y-2">
                <label htmlFor="adsContent" className="text-sm font-medium text-gray-700">
                  Ads Description *
                </label>
                <div className={`border rounded-lg ${errors.adsContent ? "border-red-500" : "border-[#b0b0b0]"}`}>
                  <Controller
                    name="adsContent"
                    control={control}
                    rules={{
                      validate: validateQuillContent,
                    }}
                    render={({ field }) => (
                      <ReactQuill
                        theme="snow"
                        value={field.value}
                        onChange={field.onChange}
                        modules={modules}
                        formats={formats}
                        placeholder="Type Description here..."
                        style={{
                          backgroundColor: "inherit",
                        }}
                        className="quill-editor"
                      />
                    )}
                  />
                </div>
                {errors.adsContent && <p className="text-red-500 text-sm mt-1">{errors.adsContent.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Ads Gallery <span className="text-red-500">*</span>
                </label>

                <div className="border-2 border-dashed border-gray-300 rounded-md p-12 text-center hover:border-[#28a745] hover:bg-green-50 transition-colors">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <div className="h-12 w-12 text-gray-400">
                      <Upload className="mx-auto h-12 w-12" />
                    </div>
                    <div className="flex text-sm text-gray-500">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer font-medium text-[#28a745] hover:text-[#218838]"
                      >
                        <span>Drop your images here, or browse</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          className="sr-only"
                          accept="image/jpeg,image/png,image/jpg,image/webp"
                          onChange={handleImageUpload}
                          multiple
                        />
                      </label>
                    </div>
                    <p className="text-xs text-gray-400">JPEG, PNG, JPG, WebP are allowed (Max 5MB per image)</p>
                  </div>
                </div>
                {/* Image Preview Section */}
                {images.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Uploaded Images ({images.length})</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {images.map((image, index) => (
                        <div key={index} className="relative group">
                          <div className="aspect-square rounded-lg overflow-hidden border-2 border-gray-200 hover:border-[#28a745] transition-colors">
                            <Image
                              src={image.preview || "/placeholder.svg"}
                              alt={`Preview ${index + 1}`}
                              width={200}
                              height={200}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg"
                            aria-label={`Remove image ${index + 1}`}
                          >
                            <X className="h-4 w-4" />
                          </button>
                          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <p className="truncate">{image.file.name}</p>
                            <p>{(image.file.size / 1024 / 1024).toFixed(2)} MB</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .quill-editor .ql-editor {
          min-height: 300px;
          font-size: 14px;
        }

        .quill-editor .ql-toolbar {
          border-top-left-radius: 8px;
          border-top-right-radius: 8px;
          border-bottom: 1px solid #b0b0b0;
        }

        .quill-editor .ql-container {
          border-bottom-left-radius: 8px;
          border-bottom-right-radius: 8px;
        }

        .quill-editor .ql-editor.ql-blank::before {
          font-style: normal;
          color: #9ca3af;
        }
      `}</style>
    </div>
  )
}

export default Page
