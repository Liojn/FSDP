import RecommendationClient from "./recommendation-client";
import { CategoryType } from "@/types";
import { getMetrics } from "@/lib/api";

export const dynamic = "force-dynamic";
export const revalidate = 3600; // Revalidate every hour

async function RecommendationPage() {
  // Fetch initial metrics on the server
  const metrics = await getMetrics();

  return (
    <div className="p-4 px-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">
          AI-Curated Farm Management Recommendations
        </h1>
      </div>

      {/* Pass server fetched data to client components */}
      <RecommendationClient
        initialMetrics={metrics}
        initialCategory={CategoryType.OVERALL}
      />
    </div>
  );
}

export default RecommendationPage;
