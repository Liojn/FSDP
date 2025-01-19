// src/app/recommendation/page.tsx

"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRecommendations } from "@/hooks/useRecommendations";
import { PageHeader } from "@/components/shared/page-header";
import { TrackingCard } from "@/app/recommendation/components/TrackingCard";
import CreateRecommendation from "@/app/recommendation/components/CreateRecommendation";
import { TrackingRecommendation, CreateRecommendationFormData } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";

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
      // Optionally, show a success notification
    } catch (error) {
      // Optionally, show an error notification
      console.error("Error creating recommendation:", error);
    }
  };

  // Separate recommendations into active and history based on status
  const activeRecommendations = useMemo(
    () =>
      recommendations
        ? recommendations.filter((rec) => rec.status !== "Completed")
        : [],
    [recommendations]
  );

  const historyRecommendations = useMemo(
    () =>
      recommendations
        ? recommendations.filter((rec) => rec.status === "Completed")
        : [],
    [recommendations]
  );

  // Handler to update a recommendation in the local state
  const handleUpdateRecommendation = (updatedRec: TrackingRecommendation) => {
    saveRecommendation(updatedRec);
    // No need to manually separate active and history; useMemo handles it
  };

  if (!userId) {
    return <div className="p-4 px-10">Error: User ID is required.</div>;
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
    return (
      <div className="p-4 px-10">
        <PageHeader title="Farm Management Recommendations" />
        <div className="text-red-500">
          Error loading recommendations: {error.message}
        </div>
      </div>
    );
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

      {/* Active Recommendations */}
      <div className="space-y-6">
        {activeRecommendations.length > 0 ? (
          activeRecommendations.map((rec) => (
            <TrackingCard
              key={rec.id}
              recommendation={rec}
              onUpdate={handleUpdateRecommendation}
            />
          ))
        ) : (
          <p className="text-gray-500">No active recommendations.</p>
        )}
      </div>

      {/* History Section */}
      <div className="space-y-6 mt-10">
        <div className="flex items-center gap-4 py-5">
          <h1 className="text-3xl font-bold">History</h1>
        </div>
        {historyRecommendations.length > 0 ? (
          historyRecommendations.map((rec) => (
            <TrackingCard
              key={rec.id}
              recommendation={rec}
              onUpdate={handleUpdateRecommendation}
            />
          ))
        ) : (
          <p className="text-gray-500">No completed recommendations.</p>
        )}
      </div>
    </div>
  );
};

export default RecommendationPage;
