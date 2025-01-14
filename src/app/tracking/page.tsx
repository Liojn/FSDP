"use client";

import React from "react";
import { useRecommendations } from "@/hooks/useRecommendation";
import { TrackingCard } from "./component/TrackingCard";
import CreateRecommendation from "./component/CreateRecommendation";
import { PageHeader } from "@/components/shared/page-header";
import { TrackingRecommendation } from "@/types";

export const dynamic = "force-dynamic";

export default function TrackingPage({
  searchParams,
}: {
  searchParams?: { scopes?: string | string[] };
}) {
  const userId = localStorage.getItem("userId");

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

  if (!userId) {
    return <div>Error: User ID is required.</div>;
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error loading tracking data: {error.message}</div>;
  }

  return (
    <main className="min-h-screen">
      <div className="container mx-auto py-12 px-4">
        <PageHeader title="Tracking Recommendations" />
        <div className="space-y-6">
          <CreateRecommendation onSubmit={handleCreateRecommendation} />
          {(recommendations ?? []).map((rec) => (
            <TrackingCard
              key={rec.id}
              recommendation={rec}
              onUpdate={saveRecommendation}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
