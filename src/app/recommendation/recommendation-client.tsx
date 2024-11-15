/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useCallback, useMemo, Suspense } from "react";
import useSWR from "swr";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  CategoryType,
  Recommendation,
  ImplementedRecommendationsState,
  MetricData,
} from "@/types";
import RecommendationSkeleton from "./components/RecommendationSkeleton";
import RecommendationCard from "./components/RecommendationCard";
import ImplementationTracker from "./components/ImplementationTracker";
class ErrorBoundary extends React.Component<{
  fallback: React.ReactNode;
  children: React.ReactNode;
}> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}

const recommendationFetcher = async ({
  url,
  data,
}: {
  url: string;
  data: any;
}): Promise<{ recommendations: Recommendation[] }> => {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorData = await response.json();
    console.error("API Error:", errorData);
    throw new Error(errorData.error || "Failed to fetch recommendations");
  }
  return response.json();
};

interface RecommendationClientProps {
  initialMetrics: MetricData;
  initialCategory: CategoryType;
  initialScopes?: string[];
}

export default function RecommendationClient({
  initialMetrics,
  initialCategory,
  initialScopes = [],
}: RecommendationClientProps) {
  const { toast } = useToast();
  const [implementedRecommendations, setImplementedRecommendations] =
    useState<ImplementedRecommendationsState>({});
  const [activeCategory] = useState<CategoryType>(initialCategory);
  const [activeScopes] = useState<string[]>(initialScopes);
  const [metrics] = useState<MetricData>(initialMetrics);

  const { data, error: fetchError } = useSWR(
    {
      url: "/api/recommendation",
      data: {
        category: activeCategory,
        metrics,
        scopes: activeScopes,
        timeframe: "monthly",
        previousImplementations: Object.keys(implementedRecommendations).filter(
          (key) => implementedRecommendations[key]
        ),
      },
    },
    recommendationFetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000,
      onError: (err: Error) => {
        console.error("Error fetching recommendations:", err);
        toast({
          variant: "destructive",
          title: "System Unavailable",
          description:
            "Our AI recommendation system is temporarily down. Please try again later.",
        });
      },
    }
  );

  console.log("Data from useSWR:", data);

  // Filter recommendations by active scopes
  const filteredRecommendations = useMemo(() => {
    const recommendations = data?.recommendations || [];
    console.log("Recommendations:", recommendations);

    if (activeScopes.length === 0) return recommendations;
    return recommendations.filter((rec) =>
      activeScopes.includes(rec.scope || "")
    );
  }, [data, activeScopes]);

  const toggleRecommendation = useCallback((id: string) => {
    setImplementedRecommendations((prev) => {
      const newState = { ...prev };
      newState[id] = !newState[id];
      return newState;
    });
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Personalized Recommendations</CardTitle>
          <CardDescription>
            AI-generated suggestions to improve your farm management
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {fetchError ? (
              <div className="py-4 text-center text-red-500">
                Failed to load recommendations. Please try again.
              </div>
            ) : !data ? (
              <div className="mt-4">
                <RecommendationSkeleton />
              </div>
            ) : (
              <div className="space-y-4">
                {filteredRecommendations.length ? (
                  filteredRecommendations.map((rec) => (
                    <RecommendationCard
                      key={rec.id}
                      rec={rec}
                      isImplemented={!!implementedRecommendations[rec.id]}
                      toggleRecommendation={toggleRecommendation}
                    />
                  ))
                ) : (
                  <div className="py-4 text-center text-gray-500">
                    No recommendations available for this category and scope.
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {Object.keys(implementedRecommendations).filter(
        (key) => implementedRecommendations[key]
      ).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Implementation Progress</CardTitle>
            <CardDescription>
              Track your sustainability initiatives
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredRecommendations
                .filter((rec) => implementedRecommendations[rec.id])
                .map((rec) => (
                  <ErrorBoundary
                    key={rec.id}
                    fallback={<div>Error loading tracker</div>}
                  >
                    <Suspense
                      fallback={
                        <div className="h-20 animate-pulse bg-gray-100 rounded-lg" />
                      }
                    >
                      <ImplementationTracker
                        recommendation={rec}
                        progress={Math.random() * 100}
                      />
                    </Suspense>
                  </ErrorBoundary>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
