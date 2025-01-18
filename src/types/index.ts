// Enum for Category Type
export enum CategoryType {
  OVERALL = "Overall",
  ENERGY = "Energy",
  WASTE = "Waste",
  CROPS = "Crops",
  LIVESTOCK = "Livestock",
  CUSTOM = "Custom", // Placeholder for dynamic categories
}

// Base Recommendation Type
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
  status: string;
  difficulty: string;
  estimatedTimeframe: string;
}

// Implementation Step for tracking
export interface ImplementationStep {
  id: string;
  step: string;
  complete: boolean;
}

// Note interface for tracking
export interface Note {
  id: string;
  content: string;
  timestamp: string;
}

// Extended TrackingRecommendation Type
export interface TrackingRecommendation extends Recommendation {
  // Override status with specific tracking states
  status: "Not Started" | "In Progress" | "Completed";
  
  // Additional tracking fields
  progress: number;
  trackingImplementationSteps: ImplementationStep[];
  completedSteps: number;
  notes: Note[];
}

export interface CreateRecommendationFormData {
  userId: string;
  title: string;
  description: string;
  scope: string;
  impact: string;
  category: CategoryType;
  estimatedEmissionReduction: number;
  priorityLevel: "Low" | "Medium" | "High";
  implementationSteps: string[];
  difficulty: "Easy" | "Medium" | "Hard";
  estimatedTimeframe: string;
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

// Recommendation Response Data Interface
export interface ResponseData {
  metrics: MetricData;
  weatherData: WeatherData;
  recommendations?: Recommendation[];
}

// Recommendation Card Props
export interface RecommendationCardProps {
  rec: Recommendation;
  isImplemented?: boolean;
  toggleRecommendation?: (id: string) => void;
}

// Metric Data Type (based on previous context)
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
