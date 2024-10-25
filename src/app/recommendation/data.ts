// Define the category types as an enum
export enum CategoryType {
  ENERGY = "energy",
  EMISSIONS = "emissions",
  WATER = "water",
  WASTE = "waste",
}

// Interface for performance metrics
export interface PerformanceMetric {
  current: number;
  average: number;
}

// Interface for performance data
export type PerformanceData = Record<CategoryType, PerformanceMetric>;
// Interface for recommendations
export interface Recommendation {
  category: CategoryType;
  title: string;
  description: string;
  impact: string;
  steps: string[];
  savings: number;
  implemented: boolean;
}

// Type guard to check if a string is a valid CategoryType
export function isCategoryType(category: string): category is CategoryType {
  return Object.values(CategoryType).includes(category as CategoryType);
}

// Export the typed data
export const performanceData: PerformanceData = {
  [CategoryType.ENERGY]: { current: 135, average: 100 },
  [CategoryType.EMISSIONS]: { current: 125, average: 100 },
  [CategoryType.WATER]: { current: 140, average: 100 },
  [CategoryType.WASTE]: { current: 120, average: 100 },
};
export const recommendations: Recommendation[] = [
  {
    category: CategoryType.ENERGY,
    title: "Upgrade Irrigation Pumps",
    description: "Replace old irrigation pumps with energy-efficient models.",
    impact: "Reduce energy usage by 20% and save $5,000 annually.",
    steps: [
      "Research energy-efficient irrigation pump models",
      "Get quotes from suppliers",
      "Schedule installation with a qualified technician",
    ],
    savings: 5000,
    implemented: false,
  },
  {
    category: CategoryType.ENERGY,
    title: "Install Solar Panels",
    description: "Implement a solar panel system to generate renewable energy.",
    impact: "Reduce carbon footprint by 30% and save $10,000 in the long term.",
    steps: [
      "Conduct a solar feasibility study",
      "Choose a reputable solar installer",
      "Apply for available solar incentives",
    ],
    savings: 10000,
    implemented: false,
  },
  {
    category: CategoryType.EMISSIONS,
    title: "Optimize Machinery Usage",
    description: "Upgrade to electric or hybrid farm equipment.",
    impact: "Lower emissions by 25% and reduce fuel costs by $3,000 annually.",
    steps: [
      "Identify machinery for replacement",
      "Research electric/hybrid alternatives",
      "Create a phased replacement plan",
    ],
    savings: 3000,
    implemented: false,
  },
  {
    category: CategoryType.WATER,
    title: "Implement Drip Irrigation",
    description:
      "Switch to a drip irrigation system for more efficient water use.",
    impact: "Reduce water usage by 30%, saving $2,500 annually on water bills.",
    steps: [
      "Design a drip irrigation layout",
      "Purchase necessary equipment",
      "Install the system or hire professionals",
    ],
    savings: 2500,
    implemented: false,
  },
  {
    category: CategoryType.WASTE,
    title: "Expand Composting Program",
    description: "Increase composting efforts to reduce landfill waste.",
    impact: "Divert 25% more waste from landfills and improve soil health.",
    steps: [
      "Set up additional composting bins",
      "Train staff on proper composting techniques",
      "Implement a system to use compost in farm operations",
    ],
    savings: 2000,
    implemented: false,
  },
];

// Colors for each category
export const COLORS: string[] = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

// Optional: Map colors to categories for consistency
export const CategoryColors: Record<CategoryType, string> = {
  [CategoryType.ENERGY]: COLORS[0],
  [CategoryType.EMISSIONS]: COLORS[1],
  [CategoryType.WATER]: COLORS[2],
  [CategoryType.WASTE]: COLORS[3],
};
