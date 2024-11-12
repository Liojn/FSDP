"use client";

import React, { useState, useCallback, useMemo, Suspense } from "react";
import dynamic from "next/dynamic";
import useSWR from "swr";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ChartsSkeleton from "./components/ChartsSkeleton";
import RecommendationCard from "./components/RecommendationCard";
import RecommendationSkeleton from "./components/RecommendationSkeleton";
import ThresholdSettings from "../dashboards/components/ThresholdSettings";
import ThresholdAlert from "../dashboards/components/ThresholdAlert";
import { useToast } from "@/hooks/use-toast";
import {
  CategoryType,
  Recommendation,
  ImplementedRecommendationsState,
  CategoryData,
  MetricData,
} from "@/types";

// Dynamic imports for charts
const YearlyComparison = dynamic(
  () => import("./components/YearlyComparison"),
  {
    loading: () => <ChartsSkeleton />,
  }
);

const CategoryBreakdown = dynamic(
  () => import("./components/CategoryBreakdown"),
  {
    loading: () => <ChartsSkeleton />,
  }
);

const TrendAnalysis = dynamic(() => import("./components/TrendAnalysis"), {
  loading: () => <ChartsSkeleton />,
});

const CrossCategoryInsights = dynamic(
  () => import("./components/CrossCategoryInsights"),
  {
    loading: () => <ChartsSkeleton />,
  }
);

const ImplementationTracker = dynamic(
  () => import("./components/ImplementationTracker"),
  {
    loading: () => (
      <div className="h-20 animate-pulse bg-gray-100 rounded-lg" />
    ),
  }
);

type EmissionScope = "Scope 1" | "Scope 2" | "Scope 3" | "All Scopes";

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
  if (!response.ok) throw new Error("Failed to fetch recommendations");
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

export default function RecommendationClient({
  initialMetrics,
  initialCategory,
}: {
  initialMetrics: MetricData;
  initialCategory: CategoryType;
}) {
  const { toast } = useToast();
  const [implementedRecommendations, setImplementedRecommendations] =
    useState<ImplementedRecommendationsState>(new Set());
  const [activeCategory, setActiveCategory] =
    useState<CategoryType>(initialCategory);
  const [activeScope, setActiveScope] = useState<EmissionScope>("All Scopes");
  const [metrics] = useState<MetricData>(initialMetrics);
  const [shouldFetch, setShouldFetch] = useState(false);

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

  // Modified SWR configuration
  const { error: fetchError } = useSWR(
    shouldFetch && !fetchedCategories.has(activeCategory)
      ? {
          url: "/api/recommendation",
          data: {
            category: activeCategory,
            metrics,
            timeframe: "monthly",
            previousImplementations: Array.from(implementedRecommendations),
          },
        }
      : null,
    async (key) => {
      const result = await recommendationFetcher(key);
      setRecommendationsByCategory((prev) => ({
        ...prev,
        [activeCategory]: result.recommendations,
      }));
      setFetchedCategories((prev) => new Set(prev).add(activeCategory));
      return result;
    },
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

  const filteredRecommendations = useMemo(() => {
    const recommendations = recommendationsByCategory[activeCategory] || [];
    if (activeScope === "All Scopes") return recommendations;
    return recommendations.filter((rec) => rec.scope === activeScope);
  }, [recommendationsByCategory, activeCategory, activeScope]);

  const totalSavings = useMemo(
    () =>
      filteredRecommendations
        .filter((rec) => implementedRecommendations.has(rec.title))
        .reduce((acc, rec) => acc + rec.savings, 0),
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

  const handleTabChange = useCallback((category: CategoryType) => {
    setActiveCategory(category);
    setShouldFetch(true);
  }, []);

  const handleScopeChange = useCallback((scope: EmissionScope) => {
    setActiveScope(scope);
  }, []);

  const handleViewRecommendations = useCallback((scope: string) => {
    setActiveScope(scope as EmissionScope);
    setShouldFetch(true);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="text-xl font-semibold text-green-600">
          Potential Savings: ${totalSavings.toLocaleString()}
        </div>
        <ThresholdSettings />
      </div>

      {/* Threshold Alert */}
      <ThresholdAlert
        metrics={metrics}
        onViewRecommendations={handleViewRecommendations}
      />

      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ErrorBoundary fallback={<div>Error loading charts</div>}>
            <Suspense fallback={<ChartsSkeleton />}>
              <YearlyComparison data={metrics} />
              <CategoryBreakdown data={metrics} category={activeCategory} />
              <TrendAnalysis data={metrics} category={activeCategory} />
              <CrossCategoryInsights data={metrics} />
            </Suspense>
          </ErrorBoundary>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Personalized Recommendations</CardTitle>
          <CardDescription>
            AI-generated suggestions to improve your farm management
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Tabs defaultValue={CategoryType.OVERALL} value={activeCategory}>
              <TabsList className="grid grid-cols-5 gap-4">
                {Object.values(CategoryType).map((category) => (
                  <TabsTrigger
                    key={category}
                    value={category}
                    onClick={() => handleTabChange(category)}
                    className="w-full"
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            <Tabs defaultValue="All Scopes" value={activeScope}>
              <TabsList className="grid grid-cols-4 gap-4">
                {["All Scopes", "Scope 1", "Scope 2", "Scope 3"].map((scope) => (
                  <TabsTrigger
                    key={scope}
                    value={scope}
                    onClick={() => handleScopeChange(scope as EmissionScope)}
                    className="w-full"
                  >
                    {scope}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            {fetchError ? (
              <div className="py-4 text-center text-red-500">
                Failed to load recommendations. Please try again.
              </div>
            ) : !shouldFetch ? (
              <div className="py-4 text-center text-gray-500">
                Select a category to view recommendations
              </div>
            ) : !fetchedCategories.has(activeCategory) ? (
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
