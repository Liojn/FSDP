// src/app/recommendation/page.tsx

"use client";

import React, { useEffect, useState, Suspense, lazy } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { TrackingRecommendation } from "@/types";

// Lazy load components
const TrackingCard = lazy(() =>
  import("@/app/recommendation/components/TrackingCard").then((module) => ({
    default: module.TrackingCard, // Reference the named export
  }))
);
const AIRecommendationChat = lazy(
  () => import("@/app/recommendation/components/AIRecommendationChat")
);

/**
 * Skeleton loader for recommendation cards
 */
function RecommendationSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, index) => (
        <div
          key={index}
          className="border rounded-md p-4 space-y-2 shadow-sm bg-white"
        >
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      ))}
    </div>
  );
}

export default function RecommendationPage({
  searchParams,
}: {
  searchParams?: { scopes?: string | string[] };
}) {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const [recommendations, setRecommendations] = useState<
    TrackingRecommendation[]
  >([]);

  const scopesParam = searchParams?.scopes;
  const scopes = React.useMemo(() => {
    return Array.isArray(scopesParam)
      ? scopesParam
      : scopesParam
      ? [scopesParam]
      : [];
  }, [scopesParam]);

  useEffect(() => {
    setUserId(localStorage.getItem("userId"));
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!userId) return;
        setLoading(true);

        const scopeQuery =
          scopes.length > 0 ? `&scopes=${scopes.join(",")}` : "";
        const res = await fetch(`/api/userData?userId=${userId}${scopeQuery}`, {
          method: "GET",
        });

        if (!res.ok) {
          throw new Error(`Failed to load user data: ${res.statusText}`);
        }

        const data = await res.json();
        setRecommendations(data.recommendations);
        setLoading(false);
      } catch (err) {
        console.error("Error in RecommendationPage fetchData:", err);
        setError(err as Error);
        setLoading(false);
      }
    };

    fetchData();
  }, [userId, scopes]);

  /**
   * Callback to add new recommendations from AIRecommendationChat
   */
  const addRecommendations = (newRecs: TrackingRecommendation[]) => {
    setRecommendations((prev) => [...prev, ...newRecs]);
  };

  const handleUpdateRecommendation = (updatedRec: TrackingRecommendation) => {
    setRecommendations((prev) => {
      return prev.map((r) => (r.id === updatedRec.id ? updatedRec : r));
    });
  };

  const handleDelete = (id: string) => {
    setRecommendations((prev) => prev.filter((rec) => rec.id !== id));
  };

  if (!userId)
    return <div className="p-4 px-10">Error: User ID not found.</div>;
  if (error) {
    return (
      <div className="p-4 px-10">
        <p className="text-red-500">
          Error loading recommendations: {error.message}
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 px-10">
      <PageHeader title="Farm Management Recommendations" />

      {/* Integrate AIRecommendationChat without the toggle */}
      <Suspense fallback={<Skeleton className="h-10 w-full mb-6" />}>
        <div className="mb-6">
          <AIRecommendationChat
            userId={userId}
            onGenerate={addRecommendations}
          />
        </div>
      </Suspense>

      {/* Display Recommendations */}
      <Suspense fallback={<RecommendationSkeleton />}>
        {loading ? (
          <RecommendationSkeleton />
        ) : (
          <>
            {/* Active Recommendations */}
            <div className="space-y-6">
              {recommendations.filter((rec) => rec.status !== "Completed")
                .length > 0 ? (
                recommendations
                  .filter((rec) => rec.status !== "Completed")
                  .map((rec) => (
                    <TrackingCard
                      key={rec.id}
                      recommendation={rec}
                      onUpdate={handleUpdateRecommendation}
                      onDelete={handleDelete} // Pass the onDelete callback
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
              {recommendations.filter((rec) => rec.status === "Completed")
                .length > 0 ? (
                recommendations
                  .filter((rec) => rec.status === "Completed")
                  .map((rec) => (
                    <TrackingCard
                      key={rec.id}
                      recommendation={rec}
                      onUpdate={handleUpdateRecommendation}
                      onDelete={handleDelete} // Pass the onDelete callback
                    />
                  ))
              ) : (
                <p className="text-gray-500">No completed recommendations.</p>
              )}
            </div>
          </>
        )}
      </Suspense>
    </div>
  );
}
