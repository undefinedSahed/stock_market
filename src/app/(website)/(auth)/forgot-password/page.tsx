"use client";

import { useState } from "react";
import ForgotPasswordStep from "@/components/Authentication/ForgotPass";
import OtpVerificationStep from "@/components/Authentication/OtpVerification";
import ResetPasswordStep from "@/components/Authentication/ResetPasswordForm";

export type ForgotPasswordData = {
  email: string;
  userId: string;
  otp: string;
};

export default function ForgotPasswordFlow() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<ForgotPasswordData>({
    email: "",
    userId: "",
    otp: "",
  });

  const nextStep = () => setCurrentStep((prev) => prev + 1);
  const prevStep = () => setCurrentStep((prev) => prev - 1);

  const updateFormData = (data: Partial<ForgotPasswordData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <ForgotPasswordStep
            onNext={nextStep}
            onUpdateData={updateFormData}
            initialEmail={formData.email}
          />
        );
      case 2:
        return (
          <OtpVerificationStep
            email={formData.email}
            onNext={nextStep}
            onBack={prevStep}
            onUpdateData={updateFormData}
          />
        );
      case 3:
        return (
          <ResetPasswordStep
            email={formData.email} // Pass email
            otp={formData.otp} // Pass otp
            onBack={prevStep}
            onComplete={() => {
              window.location.href = "/login";
            }}
          />
        );
      default:
        return null;
    }
  };

  return renderStep();
}
