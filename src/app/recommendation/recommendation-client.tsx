// recommendation-client.tsx

/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import {
  saveRecommendationsToBackend,
  fetchRecommendationsFromBackend,
} from "@/services/recommendationService";

import React, { useState, useCallback, useMemo } from "react";
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
import RecommendationCard from "@/app/recommendation/components/RecommendationCard";

/** ====================
 *  Interface Props
 *  ====================
 */
interface RecommendationClientProps {
  userId: string; // Added userId
  initialMetrics: MetricData;
  initialCategory: CategoryType;
  initialScopes?: string[];
  weatherData: any[];
}

/** ====================
 *  Hybrid Cache
 *  ====================
 */
const recommendationCache = new Map<string, Recommendation[]>();

/**
 * Attempt to get recommendations from localStorage
 */
function fetchFromLocalStorage(key: string): Recommendation[] | null {
  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (err) {
    console.error("Error reading from localStorage:", err);
  }
  return null;
}

/** ============================
 *  RecommendationClient
 *  ============================
 */
export default function RecommendationClient({
  userId, // Destructure userId
  initialMetrics,
  initialCategory,
  initialScopes = [],
  weatherData,
}: RecommendationClientProps) {
  const { toast } = useToast();

  const [implementedRecommendations, setImplementedRecommendations] =
    useState<ImplementedRecommendationsState>({});
  const [] = useState<CategoryType>(initialCategory);
  const [activeScopes] = useState<string[]>(initialScopes);
  const [] = useState<MetricData>(initialMetrics);

  /**
   * Hybrid-caching + SWR fetcher function
   * 1. Check in-memory cache.
   * 2. If not found, check localStorage.
   * 3. If still not found, fetch from backend, store in localStorage and in-memory cache.
   */
  const fetcher = async ({
    userId,
    scopes,
    metrics,
    weatherData,
  }: {
    userId: string;
    scopes: string[];
    metrics: MetricData;
    weatherData: any[];
  }): Promise<{ recommendations: Recommendation[] }> => {
    console.log("Fetcher received:", { userId, scopes, metrics, weatherData });
    const cacheKey = JSON.stringify({ userId, scopes }); // Unique key based on userId and scopes

    // 1. Check in-memory cache
    if (recommendationCache.has(cacheKey)) {
      console.log("Using in-memory cache for recommendations");
      return {
        recommendations: recommendationCache.get(cacheKey) as Recommendation[],
      };
    }

    // 2. Check localStorage
    const localStorageData = fetchFromLocalStorage(cacheKey);
    if (localStorageData) {
      console.log("Using localStorage cache for recommendations");
      recommendationCache.set(cacheKey, localStorageData);
      return { recommendations: localStorageData };
    }

    // 3. Fetch from backend
    console.log("Fetching recommendations from backend...");
    const backendData = await fetchRecommendationsFromBackend(userId, scopes);

    if (backendData?.recommendations) {
      recommendationCache.set(cacheKey, backendData.recommendations);
      try {
        localStorage.setItem(
          cacheKey,
          JSON.stringify(backendData.recommendations)
        );
      } catch (error) {
        console.error("Error writing to localStorage:", error);
      }
      return { recommendations: backendData.recommendations };
    }

    // 4. If not found in backend, generate recommendations via AI
    console.log("Generating recommendations via AI...");

    try {
      const response = await fetch("/api/recommendation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ metrics, weatherData, scopes }),
      });

      if (!response.ok) {
        throw new Error(
          `AI recommendation generation failed: ${response.statusText}`
        );
      }

      const aiData = await response.json();
      const aiRecommendations = aiData.recommendations;

      // Cache and store AI-generated recommendations
      recommendationCache.set(cacheKey, aiRecommendations);
      localStorage.setItem(cacheKey, JSON.stringify(aiRecommendations));

      return { recommendations: aiRecommendations };
    } catch (error) {
      console.error("Error generating AI recommendations:", error);
      throw new Error("Failed to generate recommendations.");
    }
  };

  /**
   * Use SWR to handle data fetching + revalidation
   */
  console.log("SWR key:", { userId, scopes: activeScopes });

  const { data, error: fetchError } = useSWR(
    userId
      ? {
          userId,
          scopes: activeScopes,
          metrics: initialMetrics, // <= Pass them here
          weatherData, // <= And here
        }
      : null,
    fetcher,
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

  /**
   * Filter the recommendations by the user's active scopes
   */
  const filteredRecommendations = useMemo(() => {
    const recommendations = data?.recommendations || [];
    if (activeScopes.length === 0) return recommendations;
    return recommendations.filter((rec: Recommendation) =>
      activeScopes.includes(rec.scope || "")
    );
  }, [data, activeScopes]);

  /**
   * Toggle the “implemented” state of a recommendation
   * and sync that change to the backend.
   */
  const toggleRecommendation = useCallback(
    async (id: string) => {
      setImplementedRecommendations((prev) => {
        const newState = { ...prev };
        newState[id] = !newState[id];
        return newState;
      });

      // Sync the updated state to the backend (optional)
      // Just an example: pass the entire list of implemented IDs
      const implementedIds = Object.keys(implementedRecommendations).filter(
        (key) => implementedRecommendations[key]
      );
      // We include the toggled ID as well if it is newly implemented
      if (!implementedRecommendations[id]) {
        implementedIds.push(id);
      }

      try {
        await saveRecommendationsToBackend(userId, implementedIds); // Use actual userId
      } catch (error) {
        console.error("Failed to sync implemented recommendations:", error);
        toast({
          variant: "destructive",
          title: "Failed to Save",
          description:
            "We could not save your changes to the server. Please try again.",
        });
      }
    },
    [implementedRecommendations, toast, userId] // Include userId in dependencies
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Personalised Recommendations</CardTitle>
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
                <RecommendationSkeleton /> {/* Show skeleton while loading */}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredRecommendations.length ? (
                  filteredRecommendations.map((rec: Recommendation) => (
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
    </div>
  );
}
