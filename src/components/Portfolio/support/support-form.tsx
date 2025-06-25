"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

// Define the form schema with validation rules
const formSchema = z.object({
    firstName: z.string().min(2, { message: "First name must be at least 2 characters" }),
    lastName: z.string().min(2, { message: "Last name must be at least 2 characters" }),
    email: z.string().email({ message: "Please enter a valid email address" }),
    phoneNumber: z
        .string()
        .regex(/^\+?[0-9\s\-()]{7,}$/, {
            message: "Please enter a valid phone number",
        })
        .optional(),
    subject: z.string().min(5, { message: "Subject must be at least 5 characters" }),
    message: z.string().min(10, { message: "Message must be at least 10 characters" }),
})

type FormValues = z.infer<typeof formSchema>

export default function SupportForm() {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitSuccess, setSubmitSuccess] = useState(false)

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            email: "",
            phoneNumber: "",
            subject: "",
            message: "",
        },
    })

    async function onSubmit(data: FormValues) {
        setIsSubmitting(true)
        console.log(data)
        try {
            await new Promise((resolve) => setTimeout(resolve, 1000))
            setSubmitSuccess(true)
            form.reset()
        } catch (error) {
            console.error("Error submitting form:", error)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="w-full mx-auto py-6 sm:py-8 md:py-12 px-4 sm:px-6 ">
            <div className="space-y-4 md:space-y-6">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Support</h1>
                <p className="text-sm sm:text-base text-muted-foreground">
                    We&apos;re here to help! Whether you have a question about your Deals, need help with a Deal, or just want to
                    say hi, our support team is ready to assist you.
                </p>
            </div>

            {submitSuccess ? (
                <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-4 sm:p-6 md:p-8">
                    <h3 className="text-green-800 font-medium text-lg mb-2">Thank you for your message!</h3>
                    <p className="text-green-700 text-sm sm:text-base">
                        We&apos;ve received your inquiry and will get back to you as soon as possible.
                    </p>
                    <Button className="mt-4" variant="outline" onClick={() => setSubmitSuccess(false)}>
                        Send another message
                    </Button>
                </div>
            ) : (
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-4 sm:space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                            <FormField
                                control={form.control}
                                name="firstName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm font-medium">First Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter your First name" {...field} className="h-10 sm:h-11 text-base" />
                                        </FormControl>
                                        <FormMessage className="text-xs sm:text-sm" />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="lastName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm font-medium">Last Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter your Last name" {...field} className="h-10 sm:h-11 text-base" />
                                        </FormControl>
                                        <FormMessage className="text-xs sm:text-sm" />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm font-medium">Email</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Enter your Email Address"
                                                type="email"
                                                {...field}
                                                className="h-10 sm:h-11 text-base"
                                            />
                                        </FormControl>
                                        <FormMessage className="text-xs sm:text-sm" />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="phoneNumber"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm font-medium">Phone Number</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter your Phone Number" {...field} className="h-10 sm:h-11 text-base" />
                                        </FormControl>
                                        <FormMessage className="text-xs sm:text-sm" />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="subject"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-sm font-medium">Subject</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter your Subject" {...field} className="h-10 sm:h-11 text-base" />
                                    </FormControl>
                                    <FormMessage className="text-xs sm:text-sm" />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="message"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-sm font-medium">Message</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Write your Message..."
                                            className="min-h-[150px] sm:min-h-[200px] md:min-h-[250px] text-base resize-y p-3"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage className="text-xs sm:text-sm" />
                                </FormItem>
                            )}
                        />

                        <div className="pt-2 sm:pt-4 flex justify-center">
                            <Button
                                type="submit"
                                className="w-full sm:w-auto bg-green-500 hover:bg-green-600 text-white h-11 sm:h-12 px-6 sm:px-8 text-base font-medium transition-colors"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? "Submitting..." : "Submit"}
                            </Button>
                        </div>
                    </form>
                </Form>
            )}
        </div>
    )
}
