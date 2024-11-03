import * as z from 'zod';
import { ObjectId } from 'mongodb';

// Campaign status type
export type CampaignStatus = 'Active' | 'Upcoming' | 'Completed';

// Company size type
export type CompanySize = 'Small' | 'Medium' | 'Large';

// Campaign milestone type
export interface CampaignMilestone {
  percentage: number;
  reached: boolean;
  reachedAt?: Date;
}

// Base interfaces with ObjectId
export interface CampaignBase {
  name: string;
  startDate: Date;
  endDate: Date;
  status: CampaignStatus;
  totalReduction: number;
  targetReduction: number;
  signeesCount: number;
  milestones: CampaignMilestone[];
}

export interface CompanyBase {
  name: string;
  industry: string;
  size: CompanySize;
  contactPerson: string;
  email: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface CampaignParticipantBase {
  campaignId: string;
  companyId: string;
  targetReduction: number;
  currentProgress: number;
  lastUpdated: Date;
  joinedAt: Date;
}

export interface TestimonialBase {
  campaignId: string;
  companyId: string;
  content: string;
  submittedAt: Date;
  approved: boolean;
}

export interface IndustryStandardBase {
  industry: string;
  minReduction: number;
  maxReduction: number;
  multiplier: number;
}

// MongoDB document interfaces
export interface Campaign extends CampaignBase {
  _id?: string | ObjectId;
}

export interface Company extends CompanyBase {
  _id?: string | ObjectId;
}

export interface CampaignParticipant extends CampaignParticipantBase {
  _id?: string | ObjectId;
}

export interface Testimonial extends TestimonialBase {
  _id?: string | ObjectId;
}

export interface IndustryStandard extends IndustryStandardBase {
  _id?: string | ObjectId;
}

// Zod schema for company registration form validation
export const companyFormSchema = z.object({
  name: z.string().min(1, 'Company name is required'),
  industry: z.string().min(1, 'Industry is required'),
  size: z.enum(['Small', 'Medium', 'Large'], {
    required_error: 'Company size is required',
  }),
  contactPerson: z.string().min(1, 'Contact person is required'),
  email: z.string().email('Invalid email address'),
});

// Zod schema for campaign participation form validation
export const participationFormSchema = z.object({
  targetReduction: z
    .number({ invalid_type_error: 'Target reduction must be a number' })
    .min(1, 'Target reduction must be at least 1 ton'),
});

// Zod schema for testimonial submission form validation
export const testimonialFormSchema = z.object({
  content: z
    .string()
    .min(10, 'Testimonial must be at least 10 characters')
    .max(500, 'Testimonial must not exceed 500 characters'),
});

export type CompanyFormValues = z.infer<typeof companyFormSchema>;
export type ParticipationFormValues = z.infer<typeof participationFormSchema>;
export type TestimonialFormValues = z.infer<typeof testimonialFormSchema>;

// Campaign data interface for frontend display
export interface CampaignData {
  campaign: Campaign;
  participants: Array<{
    company: Company;
    participation: CampaignParticipant;
  }>;
  testimonials: Testimonial[];
  industryStandards: IndustryStandard[];
}
