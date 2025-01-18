"use client";

import React from "react";
import { useRecommendations } from "@/hooks/useRecommendations";
import { PageHeader } from "@/components/shared/page-header";
import { TrackingCard } from "@/app/recommendation/components/TrackingCard";
import CreateRecommendation from "@/app/recommendation/components/CreateRecommendation";
import { Recommendation, TrackingRecommendation } from "@/types";
import { useEffect, useState } from "react";
export const dynamic = "force-dynamic";

const RecommendationPage = ({
  searchParams,
}: {
  searchParams?: { scopes?: string | string[] };
}) => {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    setUserId(localStorage.getItem("userId"));
  }, []);

  const scopesParam = searchParams?.scopes;
  const scopes = Array.isArray(scopesParam)
    ? scopesParam
    : scopesParam
    ? [scopesParam]
    : [];

  const { recommendations, isLoading, error, saveRecommendation } =
    useRecommendations(userId || "", scopes);

  const handleCreateRecommendation = async (
    newRecommendation: TrackingRecommendation
  ) => {
    await saveRecommendation(newRecommendation);
  };

  // Convert Recommendation to TrackingRecommendation
  const convertToTrackingRecommendation = (
    rec: Recommendation
  ): TrackingRecommendation => {
    return {
      ...rec,
      status: "Not Started" as "Not Started" | "In Progress" | "Completed",
      progress: 0,
      completedSteps: 0,
      notes: [],
      trackingImplementationSteps: rec.implementationSteps.map(
        (step, index) => ({
          id: `${rec.id}-step-${index}`,
          step: step,
          complete: false,
        })
      ),
    };
  };

  if (!userId) {
    return <div>Error: User ID is required.</div>;
  }

  if (isLoading) {
    return (
      <div className="p-4 px-10">
        <PageHeader title="Farm Management Recommendations" />
        <div className="animate-pulse space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return <div>Error loading recommendations: {error.message}</div>;
  }

  return (
    <div className="p-4 px-10">
      <PageHeader title="Farm Management Recommendations" />

      <div className="mb-6">
        <CreateRecommendation onSubmit={handleCreateRecommendation} />
      </div>

      <div className="space-y-6">
        {recommendations?.map((rec) => (
          <TrackingCard
            key={rec.id}
            recommendation={convertToTrackingRecommendation(rec)}
            onUpdate={saveRecommendation}
          />
        ))}
      </div>
    </div>
  );
};

export default RecommendationPage;
