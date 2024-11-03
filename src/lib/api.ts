import { MetricData } from "@/types";

export async function getMetrics(): Promise<MetricData> {
  try {
    // Temporarily returning mock data without fetching
    return {
      energy: { consumption: 1000, previousYearComparison: 5 },
      emissions: { total: 2000, byCategory: { transportation: 500, agriculture: 1000, industry: 500 } },
      waste: { quantity: 300, byType: { plastic: 50, organic: 200, metal: 50 } },
      crops: { fertilizer: 150, area: 500 },
      livestock: { count: 100, emissions: 300 },
    };
  } catch (error) {
    console.error("Error fetching metrics:", error);
    throw new Error("Failed to fetch metrics");
  }
}
