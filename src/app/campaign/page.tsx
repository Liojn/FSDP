"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Card } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { PageHeader } from "@/components/shared/page-header";
import { FormValues, formSchema, steps } from "./types";
import { StepIndicator } from "./components/StepIndicator";
import { Step1 } from "./components/Step1";
import { Step2 } from "./components/Step2";
import { Step3 } from "./components/Step3";

export default function CampaignPage() {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const totalSteps = steps.length;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyInfo: {
        companyName: "",
        industry: "",
        size: undefined,
        email: "",
        contactPerson: "",
      },
      sustainabilityGoals: {
        targetYear: new Date().getFullYear() + 1,
        baselineYear: new Date().getFullYear(),
        emissionsTarget: undefined,
        energyTarget: undefined,
        waterTarget: undefined,
      },
      reportingPreferences: {
        frequency: "Monthly",
        format: "Web Dashboard",
        notifications: true,
      },
    },
    mode: "onBlur",
  });

  const canProceed = (step: number): boolean => {
    if (step === 1) {
      return (
        form.getValues("companyInfo.companyName") !== "" &&
        form.getValues("companyInfo.size") > 0
      );
    }
    if (step === 2) {
      return form.getValues("sustainabilityGoals.targetYear") >= 2024;
    }
    return true;
  };

  const handleNext = () => {
    const isValid = canProceed(currentStep);
    if (isValid) {
      setCurrentStep((step) => step + 1);
    } else {
      // Trigger form validation
      form.trigger(
        [
          "companyInfo" as const,
          "sustainabilityGoals" as const,
          "reportingPreferences" as const,
        ][currentStep - 1]
      );
    }
  };

  const handlePreviousStep = () => {
    setCurrentStep((step) => step - 1);
  };

  const onSubmit = async (values: FormValues) => {
    try {
      // Process form data
      console.log(values);

      toast({
        title: "Pledge Submitted!",
        description: "Thank you for your commitment to sustainability.",
        className: "bg-lime-50 border-lime-200",
      });
      form.reset();
      setCurrentStep(1);
    } catch {
      toast({
        title: "Submission Failed",
        description: "Please try again later.",
        className: "bg-red-50 border-red-200",
      });
    }
  };

  return (
    <div className="">
      <PageHeader title="Sustainability Pledge" />
      <div className="max-w-3xl mx-auto py-10 px-4">
        <Card className="border-lime-200">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <StepIndicator
                currentStep={currentStep}
                totalSteps={totalSteps}
              />

              {currentStep === 1 && <Step1 form={form} />}
              {currentStep === 2 && <Step2 form={form} />}
              {currentStep === 3 && <Step3 form={form} />}

              <div className="flex justify-between px-6 pb-6">
                {currentStep > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    className="border-lime-500 text-lime-500 hover:bg-lime-50"
                    onClick={handlePreviousStep}
                  >
                    Previous
                  </Button>
                )}
                {currentStep < totalSteps ? (
                  <Button
                    type="button"
                    className="bg-lime-500 hover:bg-lime-600 text-white ml-auto"
                    onClick={handleNext}
                    disabled={!canProceed(currentStep)}
                  >
                    Continue
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    className="bg-lime-500 hover:bg-lime-600 text-white ml-auto"
                  >
                    Submit Pledge
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </Card>
      </div>
    </div>
  );
}
