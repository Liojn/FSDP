import { ObjectId } from "mongodb";
import { z } from "zod";

/* ------------------------------------------------------------------ */
/*  1. Enums & Constants                                              */
/* ------------------------------------------------------------------ */

/**
 * Enum for different Recommendation (or Emission) categories.
 */
export enum CategoryType {
  OVERALL = "Overall",
  ENERGY = "Energy",
  WASTE = "Waste",
  CROPS = "Crops",
  LIVESTOCK = "Livestock",
}

/**
 * Campaign can have the following statuses.
 */
export type CampaignStatus = "Active" | "Upcoming" | "Completed";

/* ------------------------------------------------------------------ */
/*  2. Shared Interfaces                                              */
/* ------------------------------------------------------------------ */

/**
 * Represents a milestone within a campaign,
 * showing at what percentage of the target the milestone is reached,
 * and whether it has been reached (plus optional date).
 */
export interface CampaignMilestone {
  percentage: number;
  reached: boolean;
  reachedAt?: Date;
}


/**
 * For unlocking achievements, awarding badges, etc.
 */
export interface Achievement {
  _id: string;
  title: string;
  description: string;
  category: string; // could be "Energy", "Waste", etc.
  progress: number;
  isUnlocked: boolean;
  dateUnlocked: string | null;
  badge_id: string;
}

/* ------------------------------------------------------------------ */
/*  3. Campaign & User Entities                                       */
/* ------------------------------------------------------------------ */

/**
 * Main Campaign document interface.
 * "totalReduction" is from your DB sample. 
 * "currentProgress" is also in your sample.
 * If you want to unify them, rename one or remove if unneeded.
 */
/**
 * Represents your main Campaign document in the database.
 */
export interface Campaign {
  _id?: string | ObjectId;
  name: string;
  startDate?: Date;
  endDate?: Date;
  status: string; // e.g., "Active", "Upcoming", or "Completed"
  totalReduction?: number; // optional, if your DB stores it
  currentProgress: number;
  targetReduction: number;
  signeesCount: number;
  milestones: CampaignMilestone[];
}

/**
 * The shape of data returned by /api/campaign
 * when you fetch the active campaign.
 */
export interface CampaignData {
  campaign: Campaign;
}


/**
 * For user accounts, as in your sample DB.
 * If you’re using "Company" as a separate concept, rename accordingly.
 */
export interface User {
  _id?: string | ObjectId;
  name: string;
  email: string;
  password?: string;
  emissionGoal?: Array<{
    year: number;
    target: number; // e.g., 0.05 = 5%
  }>;
  firstYearGoal?: number;
  location?: string;
  /**
   * Aggregated total contributions (in tons of CO2, presumably).
   */
  totalContributions?: number;
}

/* ------------------------------------------------------------------ */
/*  4. Validation Schemas (Zod)                                       */
/* ------------------------------------------------------------------ */

/**
 * Example schema for a company or user registration form.
 * Adjust as necessary.
 */
export const companyFormSchema = z.object({
  name: z.string().min(1, "Company name (or user name) is required"),
  contactPerson: z.string().min(1, "Contact person is required"),
  email: z.string().email("Invalid email address"),
});

export type CompanyFormValues = z.infer<typeof companyFormSchema>;

/**
 * For user-submitted testimonials.
 */
export const testimonialFormSchema = z.object({
  content: z
    .string()
    .min(10, "Testimonial must be at least 10 characters")
    .max(500, "Testimonial must not exceed 500 characters"),
});

export type TestimonialFormValues = z.infer<typeof testimonialFormSchema>;

/* ------------------------------------------------------------------ */
/*  5. Recommendation Interfaces                                      */
/* ------------------------------------------------------------------ */

/**
 * Base Recommendation type
 */
export interface Recommendation {
  id: string;
  title: string;
  description: string;
  scope: string;
  impact: string;
  category: CategoryType;
  estimatedEmissionReduction: number;
  priorityLevel: string;
  status: string;
  difficulty: string;
  estimatedTimeframe: string;
}

/**
 * Implementation step used in TrackingRecommendation
 */
export interface ImplementationStep {
  id: string;
  step: string;
  complete: boolean;
}

/**
 * Notes attached to a recommendation
 */
export interface Note {
  id: string;
  content: string;
  timestamp: string;
}

/**
 * Extended recommendation with tracking details
 */
export interface TrackingRecommendation extends Recommendation {
  // Override status with specific tracking states
  status: "Not Started" | "In Progress" | "Completed";
  // Additional tracking fields
  progress: number;
  trackingImplementationSteps: ImplementationStep[];
  completedSteps: number;
  notes: Note[];
}

/**
 * Used when creating new recommendations via form
 */
export interface CreateRecommendationFormData {
  userId: string;
  title: string;
  description: string;
  scope: string;
  impact: string;
  category: CategoryType;
  estimatedEmissionReduction: number;
  priorityLevel: "Low" | "Medium" | "High";
  difficulty: "Easy" | "Moderate" | "Hard";
  estimatedTimeframe: string;
  implementationSteps: string[];
}

/* ------------------------------------------------------------------ */
/*  6. Other Domain Interfaces (Emissions, Weather, etc.)             */
/* ------------------------------------------------------------------ */

/**
 * Represents threshold data for a given user and scope.
 */
export interface ThresholdData {
  userId: string;
  scope: string;
  description?: string;
  value: number;
  unit: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Emission data, typically stored with a timestamp, scope, etc.
 */
export interface EmissionData {
  scope: string;
  value: number;
  unit: string;
  timestamp?: Date;
}



export interface WeatherData {
  _id: {
    $oid: string;
  };
  date: string;
  temperature: number;
  rainfall: number;
  wind_speed: number;
  location: string;
}

/* ------------------------------------------------------------------ */
/*  7. Example API Response Types                                     */
/* ------------------------------------------------------------------ */

export interface CampaignAPIResponse {
  campaign: Campaign;
  user: User;
}

/**
 * Example shape if you return metrics & weather from a recommendation endpoint.
 */
export interface ResponseData {
  metrics: MetricData;
  weatherData: WeatherData;
  recommendations?: Recommendation[];
}

/**
 * Metrics structure used by your app.
 */
export interface MetricData {
  userId: string;
  energy: {
    consumption: number;
    previousYearComparison: number;
  };
  waste: {
    quantity: number;
  };
  crops: {
    area: number;
    fertilizer: number;
  };
  livestock: {
    count: number;
    emissions: number;
  };
  emissions: {
    total: number;
    byCategory: Record<string, number>;
  };
}

/* ------------------------------------------------------------------ */
/*  8. Utility State & Helper Types                                   */
/* ------------------------------------------------------------------ */

/**
 * For tracking which recommendations are marked “implemented.”
 */
export interface ImplementedRecommendationsState {
  [recommendationId: string]: boolean;
}

/**
 * Converts an object-based state to a boolean array
 */
export function implementedToArray(state: ImplementedRecommendationsState): boolean[] {
  return Object.values(state);
}

/**
 * Converts a boolean array back to an object-based state
 */
export function arrayToImplemented(
  arr: boolean[],
  recommendations: Recommendation[]
): ImplementedRecommendationsState {
  return recommendations.reduce((acc, rec, index) => {
    acc[rec.id] = arr[index] || false;
    return acc;
  }, {} as ImplementedRecommendationsState);
}

/**
 * Converts object-based state to a Set of implemented IDs
 */
export function implementedToSet(state: ImplementedRecommendationsState): Set<string> {
  return new Set(
    Object.entries(state)
      .filter(([, implemented]) => implemented)
      .map(([id]) => id)
  );
}

/**
 * Converts a Set of IDs to object-based state
 */
export function setToImplemented(
  set: Set<string>,
  existingState?: ImplementedRecommendationsState
): ImplementedRecommendationsState {
  const newState: ImplementedRecommendationsState = existingState || {};
  set.forEach((id) => {
    newState[id] = true;
  });
  return newState;
}
