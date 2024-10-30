"use client";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, UseFormReturn } from "react-hook-form";
import * as z from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { PageHeader } from "@/components/shared/page-header";
import { AlertCircle, Shield } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Define schema with Zod
const formSchema = z
  .object({
    companyInfo: z.object({
      companyName: z
        .string()
        .min(2, "Company name must be at least 2 characters"),
      industry: z.string().min(1, "Industry is required"),
      size: z
        .number({
          required_error: "Company size is required",
          invalid_type_error: "Company size must be a number",
        })
        .int()
        .positive("Company size must be a positive number")
        .safe(), // Ensures number is within safe integer range
      email: z.string().email("Invalid email address"),
      contactPerson: z
        .string()
        .min(2, "Contact person must be at least 2 characters"),
    }),
    sustainabilityGoals: z
      .object({
        targetYear: z
          .number({
            invalid_type_error: "Target year must be a number",
          })
          .min(2024, "Target year must be 2024 or later"),
        baselineYear: z.number({
          invalid_type_error: "Baseline year must be a number",
        }),
        emissionsTarget: z
          .number({
            invalid_type_error: "Emissions target must be a number",
          })
          .positive("Emissions target must be positive"),
        energyTarget: z
          .number({
            invalid_type_error: "Energy target must be a number",
          })
          .positive("Energy target must be positive"),
        waterTarget: z
          .number({
            invalid_type_error: "Water target must be a number",
          })
          .positive("Water target must be positive"),
      })
      .refine((data) => data.baselineYear <= data.targetYear, {
        message: "Baseline year must be before or equal to the target year",
        path: ["baselineYear"],
      }),
    reportingPreferences: z.object({
      frequency: z.enum(["Monthly", "Quarterly", "Annually"]),
      format: z.enum(["PDF", "Excel", "Web Dashboard"]),
      notifications: z.boolean(),
    }),
  })
  .required();

type FormValues = z.infer<typeof formSchema>;

interface StepProps {
  form: UseFormReturn<FormValues>;
}

interface StepProgressProps {
  currentStep: number;
  totalSteps: number;
}

const steps = [
  { title: "Company Information" },
  { title: "Sustainability Goals" },
  { title: "Reporting Preferences" },
];

// Reusable TextInput component
interface TextInputProps {
  label: string;
  placeholder: string;
  name:
    | "companyInfo.companyName"
    | "companyInfo.industry"
    | "companyInfo.size"
    | "companyInfo.email"
    | "companyInfo.contactPerson"
    | "sustainabilityGoals.targetYear"
    | "sustainabilityGoals.baselineYear"
    | "sustainabilityGoals.emissionsTarget"
    | "sustainabilityGoals.energyTarget"
    | "sustainabilityGoals.waterTarget"
    | "reportingPreferences.frequency"
    | "reportingPreferences.format"
    | "reportingPreferences.notifications";
  type?: string;
  control: UseFormReturn<FormValues>["control"];
  description?: string;
}

const TextInput: React.FC<TextInputProps> = ({
  label,
  placeholder,
  name,
  type = "text",
  control,
  description,
}) => (
  <FormField
    control={control}
    name={name}
    render={({ field }) => (
      <FormItem>
        <FormLabel>{label}</FormLabel>
        <FormControl>
          <Input
            type={type}
            placeholder={placeholder}
            {...field}
            value={typeof field.value === "boolean" ? "" : field.value}
          />
        </FormControl>
        {description && <FormDescription>{description}</FormDescription>}
        <FormMessage />
      </FormItem>
    )}
  />
);

// Step components
const Step1: React.FC<StepProps> = ({ form }) => (
  <div className="space-y-6">
    <CardHeader>
      <CardTitle>Company Information</CardTitle>
      <CardDescription>
        Please provide some basic details about your company.
      </CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      <TextInput
        label="Company Name"
        placeholder="Enter company name"
        name="companyInfo.companyName"
        control={form.control}
      />
      <TextInput
        label="Industry"
        placeholder="Enter industry sector"
        name="companyInfo.industry"
        control={form.control}
      />
      <FormField
        control={form.control}
        name="companyInfo.size"
        render={({ field, fieldState }) => (
          <FormItem className="relative">
            <FormLabel>Company Size</FormLabel>
            <div className="relative">
              <FormControl>
                <Input
                  type="number"
                  placeholder="Enter number of employees"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  value={field.value || ""}
                  className={fieldState.error ? "border-red-300 pr-10" : ""}
                />
              </FormControl>
              {fieldState.error && (
                <TooltipProvider delayDuration={1}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <AlertCircle className="h-4 w-4 text-red-400 absolute right-3 top-1/2 -translate-y-1/2" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">{fieldState.error.message}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            <FormMessage className="text-xs text-red-400 mt-1" />
          </FormItem>
        )}
      />
      <TextInput
        label="Email"
        placeholder="Enter email address"
        name="companyInfo.email"
        type="email"
        control={form.control}
      />
      <TextInput
        label="Contact Person"
        placeholder="Enter contact person's name"
        name="companyInfo.contactPerson"
        control={form.control}
      />
    </CardContent>
  </div>
);

const Step2: React.FC<StepProps> = ({ form }) => (
  <div className="space-y-6">
    <CardHeader>
      <CardTitle>Sustainability Goals</CardTitle>
      <CardDescription>
        Please specify your sustainability goals and targets.
      </CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      <TextInput
        label="Target Year"
        placeholder="Enter target year"
        name="sustainabilityGoals.targetYear"
        type="number"
        control={form.control}
        description="The year by which you aim to achieve your goals."
      />
      <TextInput
        label="Baseline Year"
        placeholder="Enter baseline year"
        name="sustainabilityGoals.baselineYear"
        type="number"
        control={form.control}
        description="The year from which you're measuring progress."
      />
      <FormField
        control={form.control}
        name="sustainabilityGoals.emissionsTarget"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Emissions Reduction Target (kg CO₂)</FormLabel>
            <div className="flex items-center gap-4">
              <FormControl>
                <Input
                  type="number"
                  placeholder="Enter target reduction"
                  {...field}
                  onChange={(e) => {
                    const value =
                      e.target.value === "" ? 0 : Number(e.target.value);
                    field.onChange(value);
                  }}
                  value={field.value || ""}
                />
              </FormControl>
              <SustainabilityBadge targetReduction={field.value || 0} />
            </div>
            <FormDescription>
              Set your CO₂ reduction goal to earn achievement badges
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="sustainabilityGoals.energyTarget"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Energy Reduction Target (kWh)</FormLabel>
            <FormControl>
              <Input
                type="number"
                placeholder="Enter energy target"
                {...field}
                onChange={(e) => {
                  const value =
                    e.target.value === "" ? 0 : Number(e.target.value);
                  field.onChange(value);
                }}
                value={field.value || ""}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <TextInput
        label="Water Target (liters)"
        placeholder="Enter water target"
        name="sustainabilityGoals.waterTarget"
        type="number"
        control={form.control}
      />
    </CardContent>
  </div>
);

const Step3: React.FC<StepProps> = ({ form }) => (
  <div className="space-y-6">
    <CardHeader>
      <CardTitle>Reporting Preferences</CardTitle>
      <CardDescription>
        Select how you&apos;d prefer to track and report your progress.
      </CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      <FormField
        control={form.control}
        name="reportingPreferences.frequency"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Reporting Frequency</FormLabel>
            <FormControl>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Monthly">Monthly</SelectItem>
                  <SelectItem value="Quarterly">Quarterly</SelectItem>
                  <SelectItem value="Annually">Annually</SelectItem>
                </SelectContent>
              </Select>
            </FormControl>
            <FormDescription>
              How often would you like to report your progress?
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="reportingPreferences.format"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Reporting Format</FormLabel>
            <FormControl>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PDF">PDF</SelectItem>
                  <SelectItem value="Excel">Excel</SelectItem>
                  <SelectItem value="Web Dashboard">Web Dashboard</SelectItem>
                </SelectContent>
              </Select>
            </FormControl>
            <FormDescription>
              Choose your preferred format for reports.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="reportingPreferences.notifications"
        render={({ field }) => (
          <FormItem className="flex items-center space-x-2">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
                id="notifications"
              />
            </FormControl>
            <FormLabel htmlFor="notifications">
              Enable Email Notifications
            </FormLabel>
            <FormMessage />
          </FormItem>
        )}
      />
    </CardContent>
  </div>
);

const StepIndicator: React.FC<StepProgressProps> = ({
  currentStep,
  totalSteps,
}) => {
  return (
    <div className="m-8">
      <div className="relative flex justify-between">
        {/* Line connector */}
        <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-lime-200 -z-10" />

        {[...Array(totalSteps)].map((_, index) => (
          <div key={index} className="flex flex-col items-center gap-2">
            {/* Circle with number */}
            <div
              className={`
                w-10 h-10 rounded-full flex items-center justify-center 
                font-semibold text-sm border-2 
                ${
                  index + 1 <= currentStep
                    ? "bg-lime-500 border-lime-500 text-white"
                    : "bg-white border-lime-200 text-lime-500"
                }
              `}
            >
              {index + 1}
            </div>
            {/* Step label */}
            <span
              className={`text-sm ${
                index + 1 <= currentStep ? "text-lime-700" : "text-gray-400"
              }`}
            >
              {index === 0 ? "Company" : index === 1 ? "Goals" : "Reporting"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

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

      // Example API call
      /*
      const response = await fetch("/api/submit-pledge", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });
      */

      // Simulate successful submission
      // if (response.ok) {
      toast({
        title: "Pledge Submitted!",
        description: "Thank you for your commitment to sustainability.",
        className: "bg-lime-50 border-lime-200",
      });
      form.reset();
      setCurrentStep(1);
      // } else {
      //   // Handle server errors
      //   throw new Error("Submission failed");
      // }
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

// src/components/badges/SustainabilityBadge.tsx

interface BadgeTier {
  name: string;
  color: string;
  minReduction: number;
  icon: React.ReactNode;
}

const badgeTiers: BadgeTier[] = [
  {
    name: "Bronze",
    color: "bg-amber-600",
    minReduction: 5000,
    icon: <Shield className="h-6 w-6" />,
  },
  {
    name: "Silver",
    color: "bg-gray-400",
    minReduction: 10000,
    icon: <Shield className="h-6 w-6" />,
  },
  {
    name: "Gold",
    color: "bg-yellow-400",
    minReduction: 20000,
    icon: <Shield className="h-6 w-6" />,
  },
  {
    name: "Platinum",
    color: "bg-cyan-500",
    minReduction: 50000,
    icon: <Shield className="h-6 w-6" />,
  },
];

interface SustainabilityBadgeProps {
  targetReduction: number;
}

export const SustainabilityBadge: React.FC<SustainabilityBadgeProps> = ({
  targetReduction,
}) => {
  const currentBadge = badgeTiers.reduce((prev, curr) => {
    return targetReduction >= curr.minReduction ? curr : prev;
  }, badgeTiers[0]);

  const nextBadge = badgeTiers.find(
    (badge) => badge.minReduction > targetReduction
  );

  return (
    <div className="flex flex-col items-center gap-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={`
              ${currentBadge.color} 
              p-3 rounded-full 
              text-white
              transition-all 
              hover:scale-110
            `}
            >
              {currentBadge.icon}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-sm">
              <p className="font-semibold">{currentBadge.name} Badge</p>
              <p>Current Goal: {targetReduction.toLocaleString()} kg CO₂</p>
              {nextBadge && (
                <p className="text-xs text-gray-500 mt-1">
                  Next tier ({nextBadge.name}):
                  {nextBadge.minReduction.toLocaleString()} kg CO₂
                </p>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};
