

// Data Types
export interface MetricData {
  energy: {
    consumption: number;
    previousYearComparison: number;
  };
  emissions: {
    total: number;
    byCategory: Record<string, number>;
  };
  waste: {
    quantity: number;
    byType: Record<string, number>;
  };
  crops: {
    fertilizer: number;
    area: number;
  };
  livestock: {
    count: number;
    emissions: number;
  };
}

export type EmissionScope = "Scope 1" | "Scope 2" | "Scope 3";

export interface Recommendation {
  priority: undefined;
  roi: undefined;
  implementationTimeline: any;
  steps: any;
  savings: any;
  sourceData: any;
  id: string;
  title: string;
  description: string;
  impact: string; // Changed from ReactNode to string
  scope: EmissionScope;
  category: CategoryType;
  
  // Impact and Prioritization
  estimatedEmissionReduction: number;
  priorityLevel: 'Low' | 'Medium' | 'High';
  
  // Implementation Details
  implementationSteps: string[];
  estimatedROI: number;
  
  // Status Tracking
  status: 'Not Started' | 'Planned' | 'In Progress' | 'Completed';
  
  // Additional Metadata
  difficulty: 'Easy' | 'Moderate' | 'Challenging';
  estimatedCost: number;
  estimatedTimeframe: string;
  
  // Visualization and Tracking
  relatedMetrics?: string[];
  dashboardLink?: string;
}

export interface RecommendationCardProps {
  rec: Recommendation;
  isImplemented: boolean;
  toggleRecommendation: (title: string) => void;
}

export enum CategoryType {
  EQUIPMENT = "equipment",
  LIVESTOCK = "livestock",
  CROPS = "crops",
  WASTE = "waste",
  OVERALL = "overall"
}

// New interface for Scope-Specific Recommendations
export interface ScopeRecommendationProps {
  scope: EmissionScope;
  metrics: MetricData;
  thresholdExceeded: boolean;
}

// Expanded Recommendation Request
export interface RecommendationRequest {
  category: CategoryType;
  scope: EmissionScope;
  metrics: MetricData;
  thresholdExceeded: boolean;
}

// State Management
export type ImplementedRecommendationsState = Set<string>;
export type CategoryData = Record<CategoryType, Recommendation[]>;
