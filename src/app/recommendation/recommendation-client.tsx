"use client"; // Indicate that this file is a client component in Next.js

import { useState, useCallback, useMemo, Suspense } from "react";
import dynamic from "next/dynamic"; // Dynamically import components to improve performance
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"; // Import UI components for card layout
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; // Import tab components for navigation
import ChartsSkeleton from "./components/ChartsSkeleton"; // Loading skeleton for charts
import RecommendationCard from "./components/RecommendationCard"; // Component to display recommendations
import RecommendationSkeleton from "./components/RecommendationSkeleton"; // Loading skeleton for recommendations
import { useToast } from "@/hooks/use-toast"; // Custom hook for toast notifications
import {
  CategoryType,
  Recommendation,
  ImplementedRecommendationsState,
  CategoryData,
  MetricData,
} from "@/types"; // Import type definitions for better type safety

// Dynamically import heavy components to reduce the initial load time
const YearlyComparison = dynamic(
  () => import("./components/YearlyComparison"),
  {
    loading: () => <ChartsSkeleton />, // Show loading skeleton while the component loads
    ssr: false, // Disable server-side rendering for this component
  }
);

const CategoryBreakdown = dynamic(
  () => import("./components/CategoryBreakdown"),
  {
    loading: () => <ChartsSkeleton />, // Show loading skeleton
    ssr: false,
  }
);

const TrendAnalysis = dynamic(() => import("./components/TrendAnalysis"), {
  loading: () => <ChartsSkeleton />, // Show loading skeleton
  ssr: false,
});

const CrossCategoryInsights = dynamic(
  () => import("./components/CrossCategoryInsights"),
  {
    loading: () => <ChartsSkeleton />, // Show loading skeleton
    ssr: false,
  }
);

const ImplementationTracker = dynamic(
  () => import("./components/ImplementationTracker"),
  {
    loading: () => <div>Loading tracker...</div>, // Custom loading message
    ssr: false,
  }
);

// Define the props for the RecommendationClient component
interface RecommendationClientProps {
  initialMetrics: MetricData; // Initial metrics data
  initialCategory: CategoryType; // Initial category selected
}

// Add interface for error state
interface ErrorState {
  message: string;
  type: "AI_DOWN" | "GENERAL";
}

// Main component for displaying recommendations
export default function RecommendationClient({
  initialMetrics,
  initialCategory,
}: RecommendationClientProps) {
  const { toast } = useToast(); // Initialize the toast notification system

  // State management
  const [implementedRecommendations, setImplementedRecommendations] =
    useState<ImplementedRecommendationsState>(new Set()); // State for tracking implemented recommendations
  const [apiRecommendations, setApiRecommendations] = useState<
    Recommendation[]
  >([]); // State for storing API recommendations
  const [loading, setLoading] = useState(false); // Loading state for fetching recommendations
  const [activeCategory, setActiveCategory] =
    useState<CategoryType>(initialCategory); // State for the currently active category
  const [metrics] = useState<MetricData>(initialMetrics); // Store initial metrics
  const [, setError] = useState<ErrorState | null>(null); // State for error messages

  // Memoized recommendations to avoid unnecessary recalculations
  const allRecommendations = useMemo(() => {
    return [...apiRecommendations];
  }, [apiRecommendations]);

  // Memoized calculations for total savings based on implemented recommendations
  const totalSavings = useMemo(() => {
    return allRecommendations
      .filter((rec) => implementedRecommendations.has(rec.title)) // Filter implemented recommendations
      .reduce((acc, rec) => acc + rec.savings, 0); // Sum savings
  }, [allRecommendations, implementedRecommendations]);

  // Memoized grouping of recommendations by category
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
        acc[rec.category].push(rec); // Group recommendations by their category
      }
      return acc;
    }, initialCategories);
  }, [allRecommendations]);

  // Event handler for toggling the implementation status of a recommendation
  const toggleRecommendation = useCallback((title: string) => {
    setImplementedRecommendations((prev) => {
      const newSet = new Set(prev); // Create a new Set to avoid mutating the previous one
      if (newSet.has(title)) {
        newSet.delete(title); // Remove from Set if already implemented
      } else {
        newSet.add(title); // Add to Set if not implemented
      }
      return newSet; // Return the updated Set
    });
  }, []);

  // Fetch recommendations based on the selected category
  const fetchRecommendations = useCallback(
    async (category: CategoryType) => {
      setLoading(true); // Set loading state
      setActiveCategory(category); // Update the active category

      try {
        const requestBody = {
          category,
          metrics,
          timeframe: "monthly", // Set the timeframe for the recommendations
          previousImplementations: Array.from(implementedRecommendations), // Include previously implemented recommendations
        };

        // Send POST request to fetch recommendations
        const response = await fetch("/api/recommendation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
          cache: "no-store", // Disable caching for dynamic data
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || `HTTP error! status: ${response.status}`
          ); // Throw error for non-2xx responses
        }

        if (!data.recommendations || data.recommendations.length === 0) {
          setError({
            message: "No recommendations available for this category",
            type: "GENERAL",
          });
          setApiRecommendations((prev) => [
            ...prev.filter((r) => r.category !== category),
          ]);
          return;
        }

        setError(null);
        setApiRecommendations((prev) => [
          ...prev.filter((r) => r.category !== category),
          ...data.recommendations,
        ]);
      } catch (error) {
        console.error("Error fetching recommendations:", error); // Log the error
        setError({
          message:
            "Our AI recommendation system is currently unavailable. Please try again later.",
          type: "AI_DOWN",
        });
        toast({
          variant: "destructive",
          title: "System Unavailable",
          description:
            "Our AI recommendation system is temporarily down. Please try again later.",
        });
      } finally {
        setLoading(false); // Reset loading state
      }
    },
    [metrics, implementedRecommendations, toast]
  );

  return (
    <>
      {/* Display total potential savings */}
      <div className="text-xl font-semibold text-green-600 mb-6">
        Potential Savings: ${totalSavings.toLocaleString()}
      </div>

      {/* Render charts and analysis if metrics are available */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Suspense fallback={<ChartsSkeleton />}>
            <YearlyComparison data={metrics} /> {/* Yearly comparison chart */}
            <CategoryBreakdown data={metrics} category={activeCategory} />{" "}
            {/* Breakdown of metrics by category */}
            <TrendAnalysis data={metrics} category={activeCategory} />{" "}
            {/* Trend analysis based on metrics */}
            <CrossCategoryInsights data={metrics} />{" "}
            {/* Insights across different categories */}
          </Suspense>
        </div>
      )}

      {/* Recommendations card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Personalized Recommendations</CardTitle>
          <CardDescription>
            AI-generated suggestions to improve your farm management
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={CategoryType.OVERALL} value={activeCategory}>
            <TabsList className="grid-cols-5 gap-4">
              {Object.values(CategoryType).map((category) => (
                <TabsTrigger
                  key={category}
                  value={category}
                  onClick={() => fetchRecommendations(category)} // Fetch recommendations on tab click
                  className="w-full"
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}{" "}
                  {/* Capitalize category name */}
                </TabsTrigger>
              ))}
            </TabsList>
            {loading ? (
              <div className="mt-4">
                <RecommendationSkeleton />{" "}
                {/* Show loading skeleton while recommendations are loading */}
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
                        toggleRecommendation={toggleRecommendation} // Pass toggle function to child component
                      />
                    ))
                  )}
                </TabsContent>
              ))
            )}
          </Tabs>
        </CardContent>
      </Card>

      {/* Display implementation progress if there are implemented recommendations */}
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
                .filter((rec) => implementedRecommendations.has(rec.title)) // Filter implemented recommendations
                .map((rec) => (
                  <Suspense
                    key={rec.title}
                    fallback={<div>Loading tracker...</div>} // Show loading message while tracker loads
                  >
                    <ImplementationTracker
                      recommendation={rec} // Pass recommendation to tracker
                      progress={Math.random() * 100} // Placeholder for actual progress tracking
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
