import { UseFormReturn } from "react-hook-form";
import * as z from "zod";

// Define schema with Zod
export const formSchema = z
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
        .safe(),
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

export type FormValues = z.infer<typeof formSchema>;

export interface StepProps {
  form: UseFormReturn<FormValues>;
}

export interface StepProgressProps {
  currentStep: number;
  totalSteps: number;
}

export interface TextInputProps {
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

export const steps = [
  { title: "Company Information" },
  { title: "Sustainability Goals" },
  { title: "Reporting Preferences" },
];
