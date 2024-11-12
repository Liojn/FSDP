import RecommendationClient from "./recommendation-client";
import { CategoryType } from "@/types";
import { getMetrics } from "@/lib/api";
import { PageHeader } from "@/components/shared/page-header";

export const dynamic = "force-dynamic";
export const revalidate = 3600; // Revalidate every hour

async function RecommendationPage({
  searchParams,
}: {
  searchParams?: { scope?: string };
}) {
  // Fetch initial metrics on the server
  const metrics = await getMetrics();

  // Determine initial scope based on query parameter
  const initialScope = searchParams?.scope || "All Scopes";

  return (
    <div className="p-4 px-10">
      <PageHeader title="AI-Curated Farm Management Recommendations" />

      {/* Pass server fetched data to client components */}
      <RecommendationClient
        initialMetrics={metrics}
        initialCategory={CategoryType.OVERALL}
        initialScope={initialScope}
      />
    </div>
  );
}

export default RecommendationPage;
