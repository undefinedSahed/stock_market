"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import { Loader2 } from "lucide-react";

interface OtpVerificationStepProps {
  email: string;
  onNext: () => void;
  onBack: () => void;
  onUpdateData: (data: { otp: string }) => void;
}

export default function OtpVerificationStep({
  email,
  onNext,
  onBack,
  onUpdateData,
}: OtpVerificationStepProps) {
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const firstEmptyIndex = otp.findIndex((digit) => digit === "");
    if (firstEmptyIndex !== -1 && inputRefs.current[firstEmptyIndex]) {
      inputRefs.current[firstEmptyIndex]?.focus();
    }
  }, [otp]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain").trim();

    if (!/^\d+$/.test(pastedData)) return;

    const digits = pastedData.split("").slice(0, 6);
    const newOtp = [...otp];

    digits.forEach((digit, index) => {
      if (index < 6) newOtp[index] = digit;
    });

    setOtp(newOtp);

    const nextEmptyIndex = newOtp.findIndex((digit) => digit === "");
    if (nextEmptyIndex !== -1) {
      inputRefs.current[nextEmptyIndex]?.focus();
    } else {
      inputRefs.current[5]?.focus();
    }
  };

  const handleResendOtp = async () => {
    setIsResending(true);
    setError("");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/forgot-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email,
          }),
        }
      );

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || "Failed to resend OTP");
      }

      // Reset OTP fields
      setOtp(["", "", "", "", "", ""]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resend OTP");
    } finally {
      setIsResending(false);
    }
  };

  const handleVerify = async () => {
    const otpString = otp.join("");

    if (otpString.length !== 6) {
      setError("Please enter the complete 6-digit OTP");
      return;
    }

    setIsVerifying(true);
    setError("");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/verify-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email,
            otp: otpString,
          }),
        }
      );
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || "Invalid OTP");
      }
      onUpdateData({ otp: otpString });
      onNext();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid OTP");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#eaf6ec]">
      <div className="w-full max-w-6xl overflow-hidden rounded-3xl bg-white shadow-[0_0_40px_rgba(0,0,0,0.2)] h-[778px]">
        <div className="flex flex-col items-center justify-center h-full">
          <p className="text-center text-gray-500 mb-2">Step 2 of 3</p>

          <h1 className="text-2xl font-bold mb-4">Enter OTP</h1>

          <p className="text-center text-gray-600 mb-6">
            An OTP has been sent to {email}
            <br />
            please verify it below
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <div className="flex gap-2 mb-6">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={index === 0 ? handlePaste : undefined}
                disabled={isVerifying}
                className="w-12 h-12 text-center text-xl font-semibold border border-gray-300 rounded-md focus:border-green-500 focus:outline-none disabled:opacity-50"
              />
            ))}
          </div>

          <div className="text-sm mb-6">
            Didn&apos;t Receive OTP?
            <button
              onClick={handleResendOtp}
              disabled={isResending || isVerifying}
              className="text-green-500 font-medium ml-1 hover:text-green-600 focus:outline-none disabled:opacity-50"
            >
              {isResending ? "SENDING..." : "RESEND OTP"}
            </button>
          </div>

          <div className="flex gap-4 w-[40%]">
            <button
              onClick={onBack}
              disabled={isVerifying}
              className="flex-1 py-3 bg-gray-200 text-gray-700 font-medium rounded hover:bg-gray-300 transition-colors focus:outline-none disabled:opacity-50"
            >
              Back
            </button>
            <button
              onClick={handleVerify}
              disabled={isVerifying}
              className="flex-1 py-3 bg-green-500 text-white font-medium rounded hover:bg-green-600 transition-colors focus:outline-none disabled:opacity-50 flex items-center justify-center"
            >
              {isVerifying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
