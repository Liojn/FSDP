"use client";
import React from "react";
import { useRecommendations } from "@/hooks/useRecommendation";
import { PageHeader } from "@/components/shared/page-header";
import RecommendationSkeleton from "./components/RecommendationSkeleton";
import RecommendationCard from "./components/RecommendationCard";

export const dynamic = "force-dynamic";

const RecommendationPage = ({
  searchParams,
}: {
  searchParams?: { scopes?: string | string[] };
}) => {
  const userId = localStorage.getItem("userId"); // Get userId directly

  const scopesParam = searchParams?.scopes;
  const scopes = Array.isArray(scopesParam)
    ? scopesParam
    : scopesParam
    ? [scopesParam]
    : [];

  const { recommendations, isLoading, error } = useRecommendations(
    userId || "",
    scopes
  );

  if (!userId) {
    return <div>Error: User ID is required.</div>;
  }

  if (isLoading) {
    // Show skeleton while loading
    return (
      <div className="p-4 px-10">
        <PageHeader title="AI-Curated Farm Management Recommendations" />
        <RecommendationSkeleton />
      </div>
    );
  }

  if (error) {
    return <div>Error loading recommendations: {error.message}</div>;
  }

  return (
    <div className="p-4 px-10">
      <PageHeader title="AI-Curated Farm Management Recommendations" />
      <div className="space-y-6">
        {recommendations &&
          recommendations.map((rec) => (
            <RecommendationCard key={rec.id} rec={rec} />
          ))}
      </div>
    </div>
  );
};

export default RecommendationPage;
