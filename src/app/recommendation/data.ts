import { CategoryType } from "@/types/";

// Keep only the colors for styling
export const COLORS: readonly string[] = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
] as const;

export const CategoryColors: Record<CategoryType, string> = {
  [CategoryType.EQUIPMENT]: COLORS[0],
  [CategoryType.LIVESTOCK]: COLORS[1],
  [CategoryType.CROPS]: COLORS[2],
  [CategoryType.WASTE]: COLORS[3],
  [CategoryType.OVERALL]: COLORS[4],
};

// Type guard for category validation
export function isCategoryType(category: string): category is CategoryType {
  return Object.values(CategoryType).includes(category as CategoryType);
}
