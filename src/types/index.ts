// Enum for Category Type
export enum CategoryType {
  OVERALL = "overall",
  // Add other categories as needed
}

// Recommendation Type with fully optional fields
export interface Recommendation {
  id: string;
  title: string;
  description: string;
  scope: string;
  impact: string;
  category: CategoryType;
  estimatedEmissionReduction: number;
  priorityLevel: string;
  implementationSteps: string[];
  estimatedROI: number;
  status: string;
  difficulty: string;
  estimatedCost: number;
  estimatedTimeframe: string;
  relatedMetrics?: string[];
  dashboardLink?: string;
}

// Threshold Data Interface
export interface ThresholdData {
  userId: string;
  scope: string;
  description?: string;
  value: number;
  unit: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Emission Data Interface
export interface EmissionData {
  scope: string;
  value: number;
  unit: string;
  timestamp?: Date;
}

// Recommendation Card Props
export interface RecommendationCardProps {
  rec: Recommendation;
  isImplemented?: boolean;
  toggleRecommendation?: (id: string) => void;
}

// Metric Data Type (based on previous context)
export interface MetricData {
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

// State for Implemented Recommendations
export interface ImplementedRecommendationsState {
  [recommendationId: string]: boolean;
}

// Category Data Interface with more flexible structure
export interface CategoryData {
  [category: string]: Recommendation[];
  overall: Recommendation[];
}

// Scope Emissions Interface
export interface ScopeEmissions {
  scope1: number;
  scope2: number;
  scope3: number;
}

// Utility type to convert ImplementedRecommendationsState to boolean array
export function implementedToArray(state: ImplementedRecommendationsState): boolean[] {
  return Object.values(state);
}

// Utility type to convert boolean array to ImplementedRecommendationsState
export function arrayToImplemented(
  arr: boolean[], 
  recommendations: Recommendation[]
): ImplementedRecommendationsState {
  return recommendations.reduce((acc, rec, index) => {
    acc[rec.id] = arr[index] || false;
    return acc;
  }, {} as ImplementedRecommendationsState);
}

// Utility type to convert ImplementedRecommendationsState to Set
export function implementedToSet(state: ImplementedRecommendationsState): Set<string> {
  return new Set(
    Object.entries(state)
      .filter(([, implemented]) => implemented)
      .map(([id]) => id)
  );
}

// Utility type to convert Set back to ImplementedRecommendationsState
export function setToImplemented(
  set: Set<string>, 
  existingState?: ImplementedRecommendationsState
): ImplementedRecommendationsState {
  const newState: ImplementedRecommendationsState = existingState || {};
  set.forEach(id => {
    newState[id] = true;
  });
  return newState;
}

// Export any other existing types
export * from './leaderboard'; // If you have a leaderboard types file
