import RecommendationClient from "./recommendation-client";
import { CategoryType } from "@/types";
import { getMetrics } from "@/lib/api";
import { PageHeader } from "@/components/shared/page-header";

export const dynamic = "force-dynamic";
export const revalidate = 3600; // Revalidate every hour

async function RecommendationPage({
  searchParams,
}: {
  searchParams?: { scopes?: string | string[] };
}) {
  // Fetch initial metrics on the server
  const metrics = await getMetrics();

  // Handle scopes from query parameters
  const scopesParam = searchParams?.scopes;
  const scopes = Array.isArray(scopesParam)
    ? scopesParam
    : scopesParam
    ? [scopesParam]
    : [];

  return (
    <div className="p-4 px-10">
      <PageHeader title="AI-Curated Farm Management Recommendations" />
      {/* Pass server fetched data to client components */}
      <RecommendationClient
        initialMetrics={metrics}
        initialCategory={CategoryType.OVERALL}
        initialScopes={scopes}
      />
    </div>
  );
}

export default RecommendationPage;
