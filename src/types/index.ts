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

export interface Recommendation {
  title: string;
  description: string;
  impact: string;
  category: CategoryType;
  savings: number;
  steps: string[];
  implemented: boolean;
  priority?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  roi?: number;
  implementationTimeline?: string;
  sourceData?: string;
  dashboardLink?: string;
}

export enum CategoryType {
  EQUIPMENT = "equipment",
  LIVESTOCK = "livestock",
  CROPS = "crops",
  WASTE = "waste",
  OVERALL = "overall"
}

// Component Props Types
export interface RecommendationCardProps {
  rec: Recommendation;
  isImplemented: boolean;
  toggleRecommendation: (title: string) => void;
}

export interface YearlyComparisonProps {
  data: MetricData;
}

export interface CategoryBreakdownProps {
  data: MetricData;
  category: CategoryType;
}

export interface ImplementationTrackerProps {
  recommendation: Recommendation;
  progress: number;
}

export interface TrendAnalysisProps {
  data: MetricData;
  category: CategoryType;
}

export interface CrossCategoryInsightsProps {
  data: MetricData;
}

// API Types
export interface RecommendationRequest {
  category: CategoryType;
  metrics: MetricData;
  timeframe: string;
  previousImplementations: string[];
}

// State Types
export type ImplementedRecommendationsState = Set<string>;
export type CategoryData = Record<CategoryType, Recommendation[]>;

// Chart Types
export interface ChartDataPoint {
  name: string;
  value: number;
  category: CategoryType;
  color: string;
}

export interface UserProfile {
  name: string;
  email: string;
  avatarUrl: string;
}

export interface ApiRecommendation {
  title?: string;
  description?: string;
  impact?: string;
  savings?: number;
  steps?: string[];
  priority?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  roi?: number;
  implementationTimeline?: string;
  sourceData?: string;
  dashboardLink?: string;
}
