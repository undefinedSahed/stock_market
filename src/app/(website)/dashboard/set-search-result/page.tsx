"use client";
import PathTracker from "../_components/PathTracker";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import useAxios from "@/hooks/useAxios";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useState } from "react";

// Update the form schema to match the provided data structure
const formSchema = z.object({
  symbol: z.string().min(1, "Stock symbol is required"),
  financial_health: z.string().min(1, "Please select financial health"),
  compatitive_advantage: z
    .string()
    .min(1, "Please select competitive advantage"),
  fair_value: z.coerce.number().min(0, "Fair value must be a positive number"),
});

// Update the FormData type
type FormData = z.infer<typeof formSchema>;

const Page = () => {
  // Update the form's defaultValues
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      symbol: "",
      financial_health: "",
      compatitive_advantage: "",
    },
  });

  const axiosInstance = useAxios();

  const { mutateAsync, isPending } = useMutation({
    mutationKey: ["set-search-result"],
    mutationFn: async (data: FormData) => {
      const res = await axiosInstance.post(`/olive`, data);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Stock data saved successfully!");
      form.reset(); // Reset form after successful submission
    },
    onError: () => {
      toast.error("Failed to save stock data");
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      await mutateAsync(data);
    } catch (error) {
      // Error is already handled in the mutation's onError callback
      console.error("Submission error:", error);
    }
  };

  const handleSave = () => {
    form.handleSubmit(onSubmit)();
  };

  const [file, setFile] = useState<File | null>(null);

  const { mutateAsync: uploadCSV, isPending: isUploadingCSV } = useMutation({
    mutationKey: ["upload-csv"],
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);

      const res = await axiosInstance.post(`/olive/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success("CSV file uploaded successfully!");
      setFile(null);
      // Reset the file input
      const fileInput = document.getElementById("csv-file") as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    },
    onError: () => {
      toast.error("Failed to upload CSV file");
    },
  });

  const handleFileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      toast.error("Please select a CSV file to upload");
      return;
    }

    try {
      await uploadCSV(file);
    } catch (error) {
      // Error is handled in the mutation's onError callback
      console.error("File upload error:", error);
    } finally {
    }
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <PathTracker />

        <Button
          onClick={handleSave}
          disabled={isPending}
          className="bg-[#28a745] py-2 px-5 rounded-lg text-white font-semibold hover:bg-[#218838] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? "Saving..." : "Save"}
        </Button>
      </div>

      <div className="border border-gray-300 p-4 rounded-lg">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Replace the stockName FormField with: */}
            <FormField
              control={form.control}
              name="symbol"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Stock Symbol
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isPending}
                      className="bg-white border-gray-300 rounded-md h-12 text-gray-900 placeholder:text-gray-500 bg-inherit"
                      placeholder="Enter Stock Symbol (e.g. AAPL)"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Replace the financialHealth FormField with: */}
            <FormField
              control={form.control}
              name="financial_health"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Financial Health
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isPending}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-white border-gray-300 rounded-md h-12 text-gray-900 placeholder:text-gray-500 bg-inherit">
                        <SelectValue placeholder="Choose" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="good">Good</SelectItem>
                      <SelectItem value="bad">Bad</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Replace the competitiveAdvantage FormField with: */}
            <FormField
              control={form.control}
              name="compatitive_advantage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Competitive Advantage
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isPending}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-white border-gray-300 rounded-md h-12 text-gray-900 placeholder:text-gray-500 bg-inherit">
                        <SelectValue placeholder="Choose" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="good">Good</SelectItem>
                      <SelectItem value="bad">Bad</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Replace the fairValue FormField with: */}
            <FormField
              control={form.control}
              name="fair_value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Fair Value
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isPending}
                      className="bg-white border-gray-300 rounded-md h-12 text-gray-900 placeholder:text-gray-500 bg-inherit"
                      placeholder="Enter Fair Value"
                      type="number"
                      step="0.01"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </div>
      <div className="border border-gray-300 p-4 rounded-lg mt-4">
        <h2 className="text-lg font-medium mb-4">Upload CSV File</h2>
        <form onSubmit={handleFileSubmit} className="space-y-4">
          <div className="relative">
            <label
              htmlFor="csv-file"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Select CSV File
            </label>
            <div className="flex items-center">
              <Input
                id="csv-file"
                type="file"
                accept=".csv"
                disabled={isUploadingCSV}
                className="bg-white border-gray-300 rounded-md h-12 text-gray-900 placeholder:text-gray-500 bg-inherit"
                onChange={(e) => {
                  const selectedFile = e.target.files?.[0] || null;
                  setFile(selectedFile);
                }}
              />
            </div>
            {file && (
              <p className="text-sm text-gray-500 mt-1">
                Selected file: {file.name}
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isUploadingCSV || !file}
            className="w-full bg-[#28a745] hover:bg-[#218838] text-white font-semibold py-3 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploadingCSV ? "Uploading..." : "Upload CSV"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Page;
