import * as z from 'zod';

// Zod schema for form validation
export const formSchema = z.object({
  companyInfo: z.object({
    companyName: z.string().min(1, 'Company name is required'),
    industry: z.string().min(1, 'Industry is required'),
    targetReduction: z
      .number({ invalid_type_error: 'Target reduction must be a number' })
      .min(1, 'Target reduction must be at least 1 ton'),
    contactPerson: z.string().min(1, 'Contact person is required'),
    email: z.string().email('Invalid email address'),
  }),
});

export type FormValues = z.infer<typeof formSchema>;

export interface Signee {
  companyName: string;
  industry: string;
  reduction: number;
  joinedAt: string;
}

export interface CampaignData {
  totalReduction: number;
  targetReduction: number;
  signees: Signee[];
}
