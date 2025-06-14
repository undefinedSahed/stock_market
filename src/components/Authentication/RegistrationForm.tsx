"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Eye, EyeOff, User, Mail } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { registerUser } from "@/app/actions/auth";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

// Define the form schema with Zod
const formSchema = z
  .object({
    userName: z.string().min(3, {
      message: "Username must be at least 3 characters.",
    }),
    email: z.string().email({
      message: "Please enter a valid email address.",
    }),
    password: z.string().min(6, {
      message: "Password must be at least 6 characters.",
    }),
    confirmPassword: z.string(),
    termsCondition : z.boolean().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof formSchema>;

export default function RegistrationForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userName: "",
      email: "",
      password: "",
      confirmPassword: "",
      termsCondition : false
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);

    try {
      const result = await registerUser({
        userName: data.userName,
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
      });

      if (result.success) {
        toast.success("Account successfully created!");
        toast.success("Please login to continue");
        router.push("/login");
      } else {
        toast.error(result.message || "Registration failed");
      }
    } catch (error) {
      toast.error("Something went wrong during registration");
      console.error("Registration error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex lg:min-h-screen items-center justify-center p-4 bg-gradient-to-l from-[white] to-[#e8f7eb]">
      <div className="w-full max-w-6xl lg:overflow-hidden rounded-[2rem] bg-white shadow-[0_0_40px_rgba(0,0,0,0.2)] h-[650px]">
        <div className="flex flex-col lg:flex-row">
          {/* Left side - Registration Form */}
          <div className="w-full p-10 md:w-1/2 mx-auto lg:h-[650px] flex flex-col items-center justify-center">
            {/* <p className="mb-4 text-center text-lg text-gray-700">
              Join our community and unlock exclusive content!
            </p> */}

            <h1 className="mb-8 text-center text-3xl font-bold">
              Registration
            </h1>

            {/* Social login options */}
            <div className="mb-6 flex justify-center space-x-4">
              <button className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                <Image
                  src="/images/Authentication/google.png"
                  alt="Google"
                  width={24}
                  height={24}
                />
              </button>
              <button className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                <Image
                  src="/images/Authentication/microsoft.png"
                  alt="Microsoft"
                  width={24}
                  height={24}
                />
              </button>
              <button className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                <Image
                  src="/images/Authentication/apple.png"
                  alt="Apple"
                  width={24}
                  height={24}
                />
              </button>
            </div>

            <p className="mb-8 text-center text-gray-600">
              or use your email for registration
            </p>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-5 w-full"
            >
              {/* Username field */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Username"
                  className="w-full rounded border border-gray-300 py-3 pl-4 pr-10 outline-none focus:border-green-500"
                  {...register("userName")}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
                  <User size={20} />
                </div>
                {errors.userName && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.userName.message}
                  </p>
                )}
              </div>

              {/* Email field */}
              <div className="relative">
                <input
                  type="email"
                  placeholder="Email"
                  className="w-full rounded border border-gray-300 py-3 pl-4 pr-10 outline-none focus:border-green-500"
                  {...register("email")}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
                  <Mail size={20} />
                </div>
                {errors.email && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password field */}
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  className="w-full rounded border border-gray-300 py-3 pl-4 pr-10 outline-none focus:border-green-500"
                  {...register("password")}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
                {errors.password && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Confirm Password field */}
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm Password"
                  className="w-full rounded border border-gray-300 py-3 pl-4 pr-10 outline-none focus:border-green-500"
                  {...register("confirmPassword")}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
                {errors.confirmPassword && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              {/* Remember Me checkbox */}
              <div className="flex items-center">
                <input
                  id="termsCondition"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-green-500 focus:ring-green-500"
                  {...register("termsCondition")}
                />
                <label
                  htmlFor="termsCondition"
                  className="ml-2 block text-sm text-gray-900"
                >
                  I agree to the <span className="text-green-500">Terms & Condition</span>
                </label>
              </div>

              {/* Register button */}
              <button
                type="submit"
                disabled={isLoading}
                className="mt-2 w-full rounded bg-green-500 py-3 font-medium text-white transition-colors hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Registering..." : "Register"}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-green-500 hover:text-green-600"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>

          <div className="bg-[#eaf6ec] p-2 rounded-b-lg lg:hidden">
            <div className="flex flex-col items-center justify-center w-full h-full text-gray-700">
              <h1 className="mb-3 text-center text-3xl font-bold">
                Hello, Welcome!
              </h1>
              <p className="mb-3 text-center">
                Enter your personal details to use all of site features
              </p>
              <Link
                href="/login"
                className="w-32 rounded border border-green-500 py-3 text-center text-green-500 transition-colors hover:bg-green-500 hover:text-white"
              >
                Login
              </Link>
            </div>
          </div>

          {/* Right side - Welcome message */}
          <div className="relative w-[70%] h-[650px] hidden lg:block">
            <div className="bg-gradient-to-br from-[#f0f9f0] to-[#e6f7e6] p-10 skew-x-12 w-full h-full absolute ml-[76px] shadow-[0_0_40px_rgba(0,0,0,0.2)]"></div>

            <div className="absolute flex flex-col items-center justify-center w-full h-full text-gray-700">
              <h1 className="mb-4 text-center text-5xl font-bold">
                Hello, Welcome!
              </h1>
              <p className="mb-8 text-center">
                Enter your personal details to use all of site features
              </p>
              <Link
                href="/login"
                className="w-32 rounded border border-green-500 py-3 text-center text-green-500 transition-colors hover:bg-green-500 hover:text-white"
              >
                Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
