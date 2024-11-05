import RecommendationClient from "./recommendation-client";
import { CategoryType } from "@/types";
import { getMetrics } from "@/lib/api";
import { PageHeader } from "@/components/shared/page-header";

export const dynamic = "force-dynamic";
export const revalidate = 3600; // Revalidate every hour

async function RecommendationPage() {
  // Fetch initial metrics on the server
  const metrics = await getMetrics();

  return (
    <div className="p-4 px-10">
      <PageHeader title="AI-Curated Farm Management Recommendations" />

      {/* Pass server fetched data to client components */}
      <RecommendationClient
        initialMetrics={metrics}
        initialCategory={CategoryType.OVERALL}
      />
    </div>
  );
}

export default RecommendationPage;
