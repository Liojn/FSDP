"use client";

import { useState, useCallback, useMemo, Suspense } from "react";
import dynamic from "next/dynamic";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ChartsSkeleton from "./components/ChartsSkeleton";
import RecommendationCard from "./components/RecommendationCard";
import RecommendationSkeleton from "./components/RecommendationSkeleton";
import { useToast } from "@/hooks/use-toast";
import {
  CategoryType,
  Recommendation,
  ImplementedRecommendationsState,
  CategoryData,
  MetricData,
} from "@/types";

// Dynamically import heavy components
const YearlyComparison = dynamic(
  () => import("./components/YearlyComparison"),
  {
    loading: () => <ChartsSkeleton />,
    ssr: false,
  }
);

const CategoryBreakdown = dynamic(
  () => import("./components/CategoryBreakdown"),
  {
    loading: () => <ChartsSkeleton />,
    ssr: false,
  }
);

const TrendAnalysis = dynamic(() => import("./components/TrendAnalysis"), {
  loading: () => <ChartsSkeleton />,
  ssr: false,
});

const CrossCategoryInsights = dynamic(
  () => import("./components/CrossCategoryInsights"),
  {
    loading: () => <ChartsSkeleton />,
    ssr: false,
  }
);

const ImplementationTracker = dynamic(
  () => import("./components/ImplementationTracker"),
  {
    loading: () => <div>Loading tracker...</div>,
    ssr: false,
  }
);

interface RecommendationClientProps {
  initialMetrics: MetricData;
  initialCategory: CategoryType;
}

export default function RecommendationClient({
  initialMetrics,
  initialCategory,
}: RecommendationClientProps) {
  const { toast } = useToast();

  // State Management
  const [implementedRecommendations, setImplementedRecommendations] =
    useState<ImplementedRecommendationsState>(new Set());
  const [apiRecommendations, setApiRecommendations] = useState<
    Recommendation[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] =
    useState<CategoryType>(initialCategory);
  const [metrics] = useState<MetricData>(initialMetrics);

  // Memoized recommendations
  const allRecommendations = useMemo(() => {
    return [...apiRecommendations];
  }, [apiRecommendations]);

  // Memoized calculations
  const totalSavings = useMemo(() => {
    return allRecommendations
      .filter((rec) => implementedRecommendations.has(rec.title))
      .reduce((acc, rec) => acc + rec.savings, 0);
  }, [allRecommendations, implementedRecommendations]);

  // Memoized category grouping
  const recommendationsByCategory = useMemo<CategoryData>(() => {
    const initialCategories: CategoryData = {
      [CategoryType.EQUIPMENT]: [],
      [CategoryType.LIVESTOCK]: [],
      [CategoryType.CROPS]: [],
      [CategoryType.WASTE]: [],
      [CategoryType.OVERALL]: [],
    };

    return allRecommendations.reduce((acc, rec) => {
      if (rec.category) {
        acc[rec.category].push(rec);
      }
      return acc;
    }, initialCategories);
  }, [allRecommendations]);

  // Event handlers
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

  // Fetch recommendations with optimistic updates
  const fetchRecommendations = useCallback(
    async (category: CategoryType) => {
      setLoading(true);
      setActiveCategory(category);

      try {
        const requestBody = {
          category,
          metrics,
          timeframe: "monthly",
          previousImplementations: Array.from(implementedRecommendations),
        };

        const response = await fetch("/api/recommendation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
          cache: "no-store", // Disable caching for dynamic data
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.recommendations) {
          setApiRecommendations((prev) => [
            ...prev.filter((r) => r.category !== category),
            ...data.recommendations,
          ]);
        }
      } catch (error) {
        console.error("Error fetching recommendations:", error);
        toast({
          title: "Failed to fetch recommendations",
          description: "Please try again later",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    },
    [metrics, implementedRecommendations, toast]
  );

  return (
    <>
      <div className="text-xl font-semibold text-green-600 mb-6">
        Potential Savings: ${totalSavings.toLocaleString()}
      </div>

      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Suspense fallback={<ChartsSkeleton />}>
            <YearlyComparison data={metrics} />
            <CategoryBreakdown data={metrics} category={activeCategory} />
            <TrendAnalysis data={metrics} category={activeCategory} />
            <CrossCategoryInsights data={metrics} />
          </Suspense>
        </div>
      )}

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Personalized Recommendations</CardTitle>
          <CardDescription>
            AI-generated suggestions to improve your farm management
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={CategoryType.OVERALL} value={activeCategory}>
            <TabsList className=" grid-cols-5 gap-4">
              {Object.values(CategoryType).map((category) => (
                <TabsTrigger
                  key={category}
                  value={category}
                  onClick={() => fetchRecommendations(category)}
                  className="w-full"
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </TabsTrigger>
              ))}
            </TabsList>
            {loading ? (
              <div className="mt-4">
                <RecommendationSkeleton />
              </div>
            ) : (
              Object.values(CategoryType).map((category) => (
                <TabsContent key={category} value={category}>
                  {recommendationsByCategory[category].length === 0 ? (
                    <div className="py-4 text-center text-gray-500">
                      No recommendations available. Click the tab to generate
                      some!
                    </div>
                  ) : (
                    recommendationsByCategory[category].map((rec) => (
                      <RecommendationCard
                        key={rec.title}
                        rec={rec}
                        isImplemented={implementedRecommendations.has(
                          rec.title
                        )}
                        toggleRecommendation={toggleRecommendation}
                      />
                    ))
                  )}
                </TabsContent>
              ))
            )}
          </Tabs>
        </CardContent>
      </Card>

      {implementedRecommendations.size > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Implementation Progress</CardTitle>
            <CardDescription>
              Track your sustainability initiatives
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {allRecommendations
                .filter((rec) => implementedRecommendations.has(rec.title))
                .map((rec) => (
                  <Suspense
                    key={rec.title}
                    fallback={<div>Loading tracker...</div>}
                  >
                    <ImplementationTracker
                      recommendation={rec}
                      progress={Math.random() * 100} // This should be replaced with actual progress tracking
                    />
                  </Suspense>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
