"use client";

import React, { useState, useMemo, useCallback, lazy, Suspense } from "react";
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
import { useToast } from "@/hooks/use-toast";
import {
  CategoryType,
  Recommendation,
  ImplementedRecommendationsState,
  CategoryData,
  ApiRecommendation,
  MetricData,
  RecommendationRequest,
} from "@/types/";
import RecommendationSkeleton from "./components/RecommendationSkeleton";

// Lazy load components
const YearlyComparison = lazy(() => import("./components/YearlyComparison"));
const CategoryBreakdown = lazy(() => import("./components/CategoryBreakdown"));
const TrendAnalysis = lazy(() => import("./components/TrendAnalysis"));
const CrossCategoryInsights = lazy(
  () => import("./components/CrossCategoryInsights")
);
const ImplementationTracker = lazy(
  () => import("./components/ImplementationTracker")
);

// Type guard to check if a string is a valid CategoryType
function isCategoryType(category: string): category is CategoryType {
  return Object.values(CategoryType).includes(category as CategoryType);
}

export default function SustainabilityRecommendations() {
  const { toast } = useToast();

  // State Management
  const [implementedRecommendations, setImplementedRecommendations] =
    useState<ImplementedRecommendationsState>(new Set());
  const [apiRecommendations, setApiRecommendations] = useState<
    Recommendation[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState<CategoryType>(
    CategoryType.OVERALL
  );
  const [metrics, setMetrics] = useState<MetricData | null>(null);

  // Combine recommendations
  const allRecommendations = useMemo(() => {
    return [...apiRecommendations];
  }, [apiRecommendations]);

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

  // Calculate total savings
  const totalSavings = useMemo(() => {
    return allRecommendations
      .filter((rec) => implementedRecommendations.has(rec.title))
      .reduce((acc, rec) => acc + rec.savings, 0);
  }, [allRecommendations, implementedRecommendations]);

  // Group recommendations by category
  const recommendationsByCategory = useMemo<CategoryData>(() => {
    const initialCategories: CategoryData = {
      [CategoryType.EQUIPMENT]: [],
      [CategoryType.LIVESTOCK]: [],
      [CategoryType.CROPS]: [],
      [CategoryType.WASTE]: [],
      [CategoryType.OVERALL]: [],
    };

    return allRecommendations.reduce((acc, rec) => {
      if (isCategoryType(rec.category)) {
        acc[rec.category].push(rec);
      }
      return acc;
    }, initialCategories);
  }, [allRecommendations]);

  // Fetch metrics data
  const fetchMetrics = async () => {
    try {
      const response = await fetch("/api/metrics");
      if (!response.ok) throw new Error("Failed to fetch metrics");
      const data = await response.json();
      setMetrics(data);
    } catch (error) {
      console.error("Error fetching metrics:", error);
      toast({
        title: "Failed to fetch metrics",
        description: "Please try again later",
        variant: "destructive",
      });
    }
  };

  // Fetch recommendations from API
  const fetchRecommendations = async (category: CategoryType) => {
    setLoading(true);
    setActiveCategory(category);

    try {
      if (!metrics) await fetchMetrics();

      const requestBody: RecommendationRequest = {
        category,
        metrics: metrics!,
        timeframe: "monthly",
        previousImplementations: Array.from(implementedRecommendations),
      };

      const response = await fetch("/api/recommendation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.recommendations) {
        const recommendationsArray = Array.isArray(data.recommendations)
          ? data.recommendations
          : [data.recommendations];

        setApiRecommendations((prev: Recommendation[]) => [
          ...prev.filter((r: Recommendation) => r.category !== category),
          ...recommendationsArray.map(
            (rec: ApiRecommendation): Recommendation => ({
              title: rec.title || `${category} Recommendation`,
              description: rec.description || "No description available",
              impact: rec.impact || "Impact not specified",
              category: category,
              savings: typeof rec.savings === "number" ? rec.savings : 0,
              steps: Array.isArray(rec.steps) ? rec.steps : [],
              implemented: false,
              priority: rec.priority,
              difficulty: rec.difficulty,
              roi: rec.roi,
              implementationTimeline: rec.implementationTimeline,
              sourceData: rec.sourceData,
              dashboardLink: rec.dashboardLink,
            })
          ),
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
  };

  // Render recommendations for a category
  const renderRecommendations = (
    category: CategoryType,
    recs: Recommendation[]
  ) => (
    <TabsContent key={category} value={category}>
      {recs.length === 0 && !loading ? (
        <div className="py-4 text-center text-gray-500">
          No recommendations available. Click the tab to generate some!
        </div>
      ) : (
        recs.map((rec) => (
          <RecommendationCard
            key={rec.title}
            rec={rec}
            isImplemented={implementedRecommendations.has(rec.title)}
            toggleRecommendation={toggleRecommendation}
          />
        ))
      )}
    </TabsContent>
  );

  // React.useEffect to fetch initial metrics
  React.useEffect(() => {
    fetchMetrics();
  }, []);

  return (
    <div className="p-4 px-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">
          AI-Curated Farm Management Recommendations
        </h1>
        <div className="text-xl font-semibold text-green-600">
          Potential Savings: ${totalSavings.toLocaleString()}
        </div>
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
            <TabsList>
              {Object.values(CategoryType).map((category) => (
                <TabsTrigger
                  key={category}
                  value={category}
                  onClick={() => fetchRecommendations(category)}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </TabsTrigger>
              ))}
            </TabsList>
            {loading ? (
              <RecommendationSkeleton />
            ) : (
              Object.values(CategoryType).map((category) =>
                renderRecommendations(
                  category,
                  recommendationsByCategory[category]
                )
              )
            )}
          </Tabs>
        </CardContent>
      </Card>

      {/* Implementation Progress Section */}
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
    </div>
  );
}
