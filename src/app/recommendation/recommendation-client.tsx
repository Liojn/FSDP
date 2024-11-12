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
import ThresholdAlert from "../dashboards/components/ThresholdAlert";
import { useToast } from "@/hooks/use-toast";
import {
  CategoryType,
  Recommendation,
  ImplementedRecommendationsState,
  CategoryData,
  MetricData,
} from "@/types";
import RecommendationSkeleton from "./components/RecommendationSkeleton";
import RecommendationCard from "./components/RecommendationCard";
import ImplementationTracker from "./components/ImplementationTracker";

const recommendationFetcher = async ({
  url,
  data,
}: {
  url: string;
  data: {
    category: CategoryType;
    metrics: MetricData;
    timeframe: string;
    previousImplementations: string[];
  };
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
    useState<ImplementedRecommendationsState>(new Set());
  const [activeCategory] = useState<CategoryType>(initialCategory);
  const [activeScopes, setActiveScopes] = useState<string[]>(initialScopes);
  const [metrics] = useState<MetricData>(initialMetrics);
  const [shouldFetch, setShouldFetch] = useState(true);

  // Store fetched recommendations in state to prevent refetching
  const [fetchedCategories, setFetchedCategories] = useState<Set<CategoryType>>(
    new Set()
  );
  const [recommendationsByCategory, setRecommendationsByCategory] =
    useState<CategoryData>(
      Object.values(CategoryType).reduce(
        (acc, category) => ({ ...acc, [category]: [] }),
        {} as CategoryData
      )
    );

  // Fetch recommendations when component mounts or category/metrics change
  const { data, error: fetchError } = useSWR(
    shouldFetch && !fetchedCategories.has(activeCategory)
      ? {
          url: "/api/recommendation",
          data: {
            category: activeCategory,
            metrics,
            scopes: activeScopes,
            timeframe: "monthly",
            previousImplementations: Array.from(implementedRecommendations),
          },
        }
      : null,
    recommendationFetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000,
      onSuccess: (result) => {
        console.log("Received recommendations:", result);
        setRecommendationsByCategory((prev) => ({
          ...prev,
          [activeCategory]: result.recommendations,
        }));
        setFetchedCategories((prev) => new Set(prev).add(activeCategory));
        setShouldFetch(false);
      },
      onError: (err: Error) => {
        console.error("Error fetching recommendations:", err);
        toast({
          variant: "destructive",
          title: "System Unavailable",
          description:
            "Our AI recommendation system is temporarily down. Please try again later.",
        });
        setShouldFetch(false);
      },
    }
  );

  const filteredRecommendations = useMemo(() => {
    const recommendations = recommendationsByCategory[activeCategory] || [];
    if (activeScopes.length === 0) return recommendations;
    return recommendations.filter((rec) =>
      activeScopes.includes(rec.scope || "")
    );
  }, [recommendationsByCategory, activeCategory, activeScopes]);

  const totalSavings = useMemo(
    () =>
      filteredRecommendations
        .filter((rec) => implementedRecommendations.has(rec.title))
        .reduce((acc, rec) => acc + rec.estimatedEmissionReduction, 0),
    [filteredRecommendations, implementedRecommendations]
  );

  const toggleRecommendation = useCallback((title: string) => {
    setImplementedRecommendations((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(title)) {
        newSet.delete(title);
      } else {
        newSet.add(title);
      }
      return newSet;
    });
  }, []);

  const handleViewRecommendations = useCallback((scope: string) => {
    setActiveScopes([scope]);
    setShouldFetch(true);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="text-xl font-semibold text-green-600">
          Potential Emission Reduction: {totalSavings.toLocaleString()} CO₂e
        </div>
      </div>

      {/* Threshold Alert */}
      <ThresholdAlert
        metrics={metrics}
        onViewRecommendations={handleViewRecommendations}
      />

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
                      key={rec.title}
                      rec={rec}
                      isImplemented={implementedRecommendations.has(rec.title)}
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

      {implementedRecommendations.size > 0 && (
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
                .filter((rec) => implementedRecommendations.has(rec.title))
                .map((rec) => (
                  <ErrorBoundary
                    key={rec.title}
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
