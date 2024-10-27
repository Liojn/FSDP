export enum CategoryType {
  ENERGY = "energy",
  EMISSIONS = "emissions",
  WATER = "water",
  WASTE = "waste",
}

export interface PerformanceMetric {
  current: number;
  average: number;
}

export type PerformanceData = Record<CategoryType, PerformanceMetric>;

export interface Recommendation {
  category: CategoryType;
  title: string;
  description: string;
  impact: string;
  steps: string[];
  savings: number;
  implemented: boolean;
}

export function isCategoryType(category: string): category is CategoryType {
  return Object.values(CategoryType).includes(category as CategoryType);
}

// Keep only the performance data for charts
export const performanceData: PerformanceData = {
  [CategoryType.ENERGY]: { current: 135, average: 100 },
  [CategoryType.EMISSIONS]: { current: 125, average: 100 },
  [CategoryType.WATER]: { current: 140, average: 100 },
  [CategoryType.WASTE]: { current: 120, average: 100 },
};

export const COLORS: string[] = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

export const CategoryColors: Record<CategoryType, string> = {
  [CategoryType.ENERGY]: COLORS[0],
  [CategoryType.EMISSIONS]: COLORS[1],
  [CategoryType.WATER]: COLORS[2],
  [CategoryType.WASTE]: COLORS[3],
};