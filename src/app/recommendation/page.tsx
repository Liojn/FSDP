/* eslint-disable @typescript-eslint/no-unused-vars */
// src/app/recommendation/page.tsx

"use client";

import React, { useEffect, useState } from "react";
import { useRecommendations } from "@/hooks/useRecommendations";
import { PageHeader } from "@/components/shared/page-header";
import { TrackingCard } from "@/app/recommendation/components/TrackingCard";
import CreateRecommendation from "@/app/recommendation/components/CreateRecommendation";
import {
  Recommendation,
  TrackingRecommendation,
  CreateRecommendationFormData,
} from "@/types";
import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton

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

  const {
    recommendations,
    isLoading,
    error,
    saveRecommendation,
    createRecommendation,
  } = useRecommendations(userId || "", scopes);

  // Handler for creating a new recommendation
  const handleCreateRecommendation = async (
    newRecommendation: CreateRecommendationFormData
  ) => {
    try {
      await createRecommendation(newRecommendation);
      // Show a success notification
    } catch (error) {
      // Show an error notification
    }
  };

  // Convert Recommendation to TrackingRecommendation
  const convertToTrackingRecommendation = (
    rec: Recommendation
  ): TrackingRecommendation => {
    return {
      ...rec,
      trackingImplementationSteps: rec.implementationSteps.map(
        (step, index) => ({
          id: `${rec.id}-step-${index}`,
          step: step,
          complete: false,
        })
      ),
      progress: 0,
      completedSteps: 0,
      notes: [],
      status: "Not Started",
    };
  };

  if (!userId) {
    return <div>Error: User ID is required.</div>;
  }

  if (isLoading) {
    return (
      <div className="p-4 px-10">
        <PageHeader title="Farm Management Recommendations" />
        {/* Skeleton Loading State */}
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white shadow-sm rounded-lg p-4">
              <Skeleton className="h-6 w-1/3 mb-4" /> {/* Title Skeleton */}
              <Skeleton className="h-4 w-full mb-2" />{" "}
              {/* Description Skeleton */}
              <Skeleton className="h-4 w-2/3 mb-2" /> {/* Scope Skeleton */}
              <Skeleton className="h-4 w-1/2 mb-4" /> {/* Impact Skeleton */}
              <div className="flex space-x-4">
                <Skeleton className="h-4 w-1/4" /> {/* Priority Skeleton */}
                <Skeleton className="h-4 w-1/4" /> {/* Difficulty Skeleton */}
              </div>
              <Skeleton className="h-4 w-1/2 mt-4" />{" "}
              {/* Estimated Timeframe Skeleton */}
            </div>
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
        {/* Pass the userId prop to CreateRecommendation */}
        <CreateRecommendation
          onSubmit={handleCreateRecommendation}
          userId={userId}
        />
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
