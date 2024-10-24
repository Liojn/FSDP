// types/index.ts

// Data Types
export interface PerformanceMetric {
  current: number;
  average: number;
}

export interface PerformanceData {
  energy: PerformanceMetric;
  emissions: PerformanceMetric;
  water: PerformanceMetric;
  waste: PerformanceMetric;
}

export interface Recommendation {
  title: string;
  description: string; // Added this required field
  impact: string; // Added this required field
  category: CategoryType;
  savings: number;
  steps: string[]; // Made this required instead of optional
  implemented?: boolean;
}

// Enum for type safety on categories
export enum CategoryType {
  ENERGY = "energy",
  EMISSIONS = "emissions",
  WATER = "water",
  WASTE = "waste",
}

// Component Props Types
export interface RecommendationCardProps {
  rec: Recommendation;
  isImplemented: boolean;
  toggleRecommendation: (title: string) => void;
}

export interface ChartsProps {
  performanceData: PerformanceData;
  COLORS: readonly string[];
}

// State Types (for useState)
export type ImplementedRecommendationsState = Set<string>;

// Utility Types
export type CategoryData = Record<CategoryType, Recommendation[]>;

// Map Categories to Colors
export type CategoryColors = Record<CategoryType, string>;

// Chart Data Types
export interface ChartDataPoint {
  name: string;
  value: number;
  category: CategoryType;
  color: string;
}
