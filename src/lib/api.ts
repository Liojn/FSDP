import { MetricData } from "@/types";
import { headers } from "next/headers";

export async function getMetrics(): Promise<MetricData> {
  const headersList = headers();
  const host = headersList.get("host") || "localhost:3000";
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
  const baseUrl = `${protocol}://${host}`;

  const response = await fetch(`${baseUrl}/api/metrics`, {
    next: {
      revalidate: 3600, // Cache for 1 hour
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch metrics");
  }

  return response.json();
}