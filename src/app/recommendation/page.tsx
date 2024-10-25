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
import { performanceData, COLORS } from "./data";
import ChartsSkeleton from "./components/ChartsSkeleton";
import RecommendationCard from "./components/RecommendationCard";
import { useToast } from "@/hooks/use-toast";
import {
  CategoryType,
  Recommendation,
  ImplementedRecommendationsState,
  CategoryData,
  ApiRecommendation,
} from "@/types/index";

// Lazy load the Charts component
const Charts = lazy(() => import("./components/Charts"));

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
    CategoryType.ENERGY
  );

  // Combine static and API recommendations
  const allRecommendations = useMemo(() => {
    return [...apiRecommendations, ...apiRecommendations];
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
      [CategoryType.ENERGY]: [],
      [CategoryType.EMISSIONS]: [],
      [CategoryType.WATER]: [],
      [CategoryType.WASTE]: [],
    };

    return allRecommendations.reduce((acc, rec) => {
      if (isCategoryType(rec.category)) {
        acc[rec.category].push(rec);
      }
      return acc;
    }, initialCategories);
  }, [allRecommendations]);

  // Fetch additional recommendations from Groq API
  const fetchRecommendations = async (category: CategoryType) => {
    setLoading(true);
    setActiveCategory(category);

    try {
      const response = await fetch("/api/recommendation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.recommendations) {
        // Ensure recommendations is always treated as an array
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

  return (
    <div className="p-4 px-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">
          AI-Curated Sustainability Recommendations
        </h1>
        <div className="text-xl font-semibold text-green-600">
          Potential Savings: ${totalSavings.toLocaleString()}
        </div>
      </div>

      <Suspense fallback={<ChartsSkeleton />}>
        <Charts performanceData={performanceData} COLORS={COLORS} />
      </Suspense>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Personalized Recommendations</CardTitle>
          <CardDescription>
            AI-generated suggestions powered by Groq to improve your
            sustainability
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={CategoryType.ENERGY} value={activeCategory}>
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
              <div className="py-4 flex items-center justify-center">
                <div className="animate-pulse text-base">
                  Generating {activeCategory} recommendations...
                </div>
              </div>
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
    </div>
  );
}
