"use client";

import type React from "react";
import { useState } from "react";
import { Upload, X } from "lucide-react";
import Image from "next/image";
import useAxios from "@/hooks/useAxios";
import { useMutation } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import "react-quill/dist/quill.snow.css";
import PathTracker from "../../_components/PathTracker";

interface NewsFormData {
  stockName: string;
  newsTitle: string;
  newsDescription: string;
  imageLink: string;
  isPaid: "true" | "false";
}

const Page = () => {
  const router = useRouter();

  const [image, setImage] = useState<{ file: File; preview: string } | null>(
    null
  );
  const [language, setLanguage] = useState<"en" | "ar">("en");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
  } = useForm<NewsFormData>({
    defaultValues: {
      newsTitle: "",
      newsDescription: "",
      imageLink: "",
      isPaid: "false",
    },
  });

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ color: [] }, { background: [] }],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ indent: "-1" }, { indent: "+1" }],
      [{ align: [] }],
      [{ direction: "rtl" }],
      ["link", "image"],
      ["blockquote", "code-block"],
      [{ script: "sub" }, { script: "super" }],
      ["clean"],
    ],
  };

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
    "direction",
    "link",
    "image",
    "blockquote",
    "code-block",
    "script",
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];

      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }

      if (!file.type.startsWith("image/")) {
        toast.error("Please select a valid image file");
        return;
      }

      const newImage = {
        file,
        preview: URL.createObjectURL(file),
      };

      if (image) URL.revokeObjectURL(image.preview);

      setImage(newImage);
    }
  };

  const removeImage = () => {
    if (image) {
      URL.revokeObjectURL(image.preview);
      setImage(null);
    }
  };

  const axiosInstance = useAxios();

  const { mutateAsync, isPending } = useMutation({
    mutationKey: ["add-news"],
    mutationFn: async (payload: FormData) => {
      const res = await axiosInstance.post("/admin/news/create-news", payload, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success("News created successfully!");
      reset();
      removeImage();
      router.push("/dashboard/news");
    },
    onError: (error: import("axios").AxiosError) => {
      const errorMessage =
        (error.response?.data as { message?: string })?.message ||
        "Failed to create news";
      toast.error(errorMessage);
    },
  });

  const onSubmit = async (data: NewsFormData) => {
    if (!image) {
      toast.error(
        language === "ar"
          ? "يرجى اختيار صورة الغلاف"
          : "Please select a cover image"
      );
      return;
    }

    try {
      const formData = new FormData();
      formData.append("symbol", data.stockName);
      formData.append("newsTitle", data.newsTitle);
      formData.append("newsDescription", data.newsDescription);
      formData.append("imageLink", image.file);
      formData.append("source", "admin");
      formData.append("isPaid", data.isPaid); // ✅ added

      await mutateAsync(formData);
    } catch (error) {
      console.error("Error creating news:", error);
      toast.error(
        language === "ar" ? "حدث خطأ غير متوقع" : "An unexpected error occurred"
      );
    }
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <PathTracker />
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
            <button
              type="button"
              onClick={() => setLanguage("en")}
              className={`px-3 py-3 w-[100px] border border-green-500 rounded-md text-sm font-medium transition-colors ${
                language === "en"
                  ? "bg-green-500 text-white font-medium shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => setLanguage("ar")}
              className={`px-3 py-3 rounded-md text-sm w-[100px] border border-green-500 font-medium transition-colors ${
                language === "ar"
                  ? "bg-green-500 text-white font-medium shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              العربية
            </button>
          </div>

          <button
            onClick={handleSubmit(onSubmit)}
            disabled={isPending}
            className="bg-[#28a745] py-3 px-5 rounded-lg text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending
              ? "savig..."
              : language === "ar"
              ? "حفظ"
              : "Save"}
          </button>
        </div>
      </div>

      <div
        className={`border border-[#b0b0b0] p-4 rounded-lg ${
          language === "ar" ? "rtl" : "ltr"
        }`}
      >
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {/* ✅ Status Field */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              {language === "ar" ? "حالة الخبر *" : "News Status *"}
            </label>
            <select
              {...register("isPaid", { required: true })}
              className="border p-4 rounded-lg bg-inherit outline-none w-full border-[#b0b0b0]"
              dir={language === "ar" ? "rtl" : "ltr"}
            >
              <option value="false">
                {language === "ar" ? "مجاني" : "Free"}
              </option>
              <option value="true">
                {language === "ar" ? "مدفوع" : "Paid"}
              </option>
            </select>
            {errors.isPaid && (
              <p className="text-red-500 text-sm">
                {language === "ar"
                  ? "يرجى تحديد حالة الخبر"
                  : "Please select news status"}
              </p>
            )}
          </div>

          {/* Stock Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              {language === "ar" ? "اسم السهم*" : "Stock's Name *"}
            </label>
            <input
              {...register("stockName", {
                required:
                  language === "ar"
                    ? "اسم السهم مطلوب"
                    : "Stock name is required",
              })}
              placeholder={
                language === "ar" ? "أدخل اسم السهم" : "Enter stock name"
              }
              className={`border p-4 rounded-lg bg-inherit outline-none w-full ${
                errors.stockName ? "border-red-500" : "border-[#b0b0b0]"
              } ${language === "ar" ? "text-right" : "text-left"}`}
              dir={language === "ar" ? "rtl" : "ltr"}
            />
            {errors.stockName && (
              <p className="text-red-500 text-sm">{errors.stockName.message}</p>
            )}
          </div>

          {/* News Title */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              {language === "ar" ? "عنوان الخبر *" : "News Title *"}
            </label>
            <input
              {...register("newsTitle", {
                required:
                  language === "ar"
                    ? "عنوان الخبر مطلوب"
                    : "News title is required",
                minLength: {
                  value: 3,
                  message:
                    language === "ar"
                      ? "يجب أن يكون العنوان 3 أحرف على الأقل"
                      : "Title must be at least 3 characters",
                },
              })}
              placeholder={
                language === "ar" ? "أدخل عنوان الخبر" : "Enter news title"
              }
              className={`border p-4 rounded-lg bg-inherit outline-none w-full ${
                errors.newsTitle ? "border-red-500" : "border-[#b0b0b0]"
              } ${language === "ar" ? "text-right" : "text-left"}`}
              dir={language === "ar" ? "rtl" : "ltr"}
            />
            {errors.newsTitle && (
              <p className="text-red-500 text-sm">{errors.newsTitle.message}</p>
            )}
          </div>

          {/* News Description */}
          <div className="space-y-2">
            <label
              htmlFor="newsDescription"
              className="text-sm font-medium text-gray-700"
            >
              {language === "ar" ? "وصف الخبر *" : "News Description *"}
            </label>
            <div className="mb-2 text-xs text-gray-500">
              {language === "ar"
                ? "💡 نصيحة: استخدم زر الاتجاه (⇄) في شريط الأدوات للتبديل بين اتجاه النص الإنجليزي والعربي"
                : "💡 Tip: Use the direction button (⇄) in the toolbar to switch between English (LTR) and Arabic (RTL) text direction"}
            </div>
            <div
              className={`border rounded-lg ${
                errors.newsDescription ? "border-red-500" : "border-[#b0b0b0]"
              }`}
            >
              <Controller
                name="newsDescription"
                control={control}
                rules={{
                  validate: (value) => {
                    const textContent = value.replace(/<[^>]*>/g, "").trim();
                    if (!textContent) {
                      return language === "ar"
                        ? "وصف الخبر مطلوب"
                        : "News description is required";
                    }
                    if (textContent.length < 10) {
                      return language === "ar"
                        ? "يجب أن يكون الوصف 10 أحرف على الأقل"
                        : "Description must be at least 10 characters long";
                    }
                    return true;
                  },
                }}
                render={({ field }) => (
                  <ReactQuill
                    theme="snow"
                    value={field.value}
                    onChange={field.onChange}
                    modules={modules}
                    formats={formats}
                    placeholder={
                      language === "ar"
                        ? "اكتب الوصف هنا..."
                        : "Type Description here..."
                    }
                    style={{
                      // backgroundColor: "inherit",
                      // height : "300px"
                    }}
                    className={`quill-editor arabic-support ${
                      language === "ar" ? "rtl-mode" : "ltr-mode"
                    }`}
                  />
                )}
              />
            </div>
            {errors.newsDescription && (
              <p className="text-red-500 text-sm">
                {errors.newsDescription.message}
              </p>
            )}
          </div>

          {/* Cover Image */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              {language === "ar" ? "صورة الغلاف *" : "Cover Image *"}
            </label>
            {image ? (
              <div className="space-y-4">
                <div className="relative inline-block">
                  <div className="w-48 h-48 relative rounded-md overflow-hidden border border-[#b0b0b0]">
                    <Image
                      src={image.preview || "/placeholder.svg"}
                      alt="News preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md opacity-90 hover:opacity-100"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-sm text-gray-600">
                  {image.file.name} (
                  {(image.file.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-md p-12 text-center">
                <div className="flex flex-col items-center justify-center space-y-2">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer text-sm text-gray-500"
                  >
                    {language === "ar"
                      ? "اسحب الصورة هنا أو تصفح"
                      : "Drop image here or browse"}
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                      accept="image/jpeg,image/png,image/jpg,image/webp"
                      onChange={handleImageUpload}
                    />
                  </label>
                  <p className="text-xs text-gray-400">
                    {language === "ar"
                      ? "JPEG, PNG, JPG, WebP مسموح (حد أقصى 5 ميجابايت)"
                      : "JPEG, PNG, JPG, WebP allowed (Max 5MB)"}
                  </p>
                </div>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Page;
