import { z } from "zod";

export interface Signee {
  companyName: string;
  industry: string;
  reduction: number;
  joinedAt: string;
}

export interface CampaignData {
  totalReduction: number;
  signees: Signee[];
}

export const formSchema = z.object({
  companyInfo: z.object({
    companyName: z.string().min(2, "Company name must be at least 2 characters"),
    industry: z.string().min(2, "Industry must be at least 2 characters"),
    targetReduction: z.number().min(1, "Target reduction must be at least 1"),
  }),
  sustainabilityGoals: z.object({}).optional(),
  reportingPreferences: z.object({}).optional(),
});

export type FormValues = z.infer<typeof formSchema>;
