"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Eye, EyeOff, User } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

// Define the form schema with Zod
const formSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(1, {
    message: "Password is required.",
  }),
  remember: z.boolean().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      remember: false,
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        toast.error(result.error);
      } else if (result?.ok) {
        toast.success("Login successful!");
        router.push("/dashboard"); // Redirect to dashboard or desired page
        router.refresh();
      }
    } catch (error) {
      toast.error("An error occurred during login");
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-r from-[white] to-[#e8f7eb]">
      <div className="w-full max-w-6xl overflow-hidden rounded-[2rem] bg-white shadow-[0_0_40px_rgba(0,0,0,0.2)] lg:h-[650px]">
        <div className="flex flex-col md:flex-row">
          {/* Left side - Welcome message */}
          <div className="relative w-[70%] h-[650px] hidden lg:block">
            <div className="bg-gradient-to-br from-[#f0f9f0] to-[#e6f7e6] p-10 -skew-x-12 w-full h-full absolute right-20 shadow-[0_0_40px_rgba(0,0,0,0.2)]"></div>

            <div className="absolute flex flex-col items-center justify-center w-full h-full text-gray-700 pr-10">
              <h1 className="mb-4 text-center text-5xl font-bold">
                Welcome Back!
              </h1>
              <p className="mb-1 text-center">
                To keep connected with us please login with your personal info
              </p>
              <p className="mb-8 text-center text-sm text-gray-600">
                Your data is safe and secure with us.
              </p>
            </div>
          </div>

          {/* Right side - Login Form */}
          <div className="w-full md:w-1/2 h-[650px] mx-auto flex flex-col items-center justify-center">
            <h1 className="mb-8 text-center text-3xl font-bold">Login</h1>

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
              or use your email for login
            </p>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-5 w-full lg:pr-5 p-3 lg:p-0"
            >
              {/* Email field */}
              <div className="relative">
                <input
                  type="email"
                  placeholder="Email"
                  className="w-full rounded border border-gray-300 py-3 pl-4 pr-10 outline-none focus:border-green-500"
                  {...register("email")}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
                  <User size={20} />
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

              {/* Remember Me checkbox */}
              <div className="flex items-center">
                <input
                  id="remember"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-green-500 focus:ring-green-500"
                  {...register("remember")}
                />
                <label
                  htmlFor="remember"
                  className="ml-2 block text-sm text-gray-900"
                >
                  Remember Me
                </label>
              </div>

              <div>
                <Link href="/forgot-password">
                  <p className="text-sm text-gray-500 text-center">
                    Forgot password?
                  </p>
                </Link>
              </div>

              {/* Login button */}
              <button
                type="submit"
                disabled={isLoading}
                className="mt-2 w-full rounded bg-green-500 py-3 font-medium text-white transition-colors hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Signing in..." : "Login"}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                {"Don't have an account? "}
                <Link
                  href="/registration"
                  className="text-green-500 hover:text-green-600"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
