"use client";
import React, { useEffect, useState } from "react";
import RecommendationClient from "./recommendation-client";
import { CategoryType, MetricData, WeatherData } from "@/types";
import { PageHeader } from "@/components/shared/page-header";
import RecommendationSkeleton from "./components/RecommendationSkeleton"; // Add skeleton component

export const dynamic = "force-dynamic";

const RecommendationPage = ({
  searchParams,
}: {
  searchParams?: { scopes?: string | string[] };
}) => {
  const [userId, setUserId] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<MetricData>({} as MetricData);
  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);
  const [loading, setLoading] = useState(true); // Track loading state

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    if (storedUserId) {
      setUserId(storedUserId);

      fetch(`/api/recommendation/data/${storedUserId}`)
        .then((response) => response.json())
        .then((fetchedData) => {
          setMetrics(fetchedData.metrics);
          setWeatherData(fetchedData.weatherData);
          setLoading(false); // Data fetched
        })
        .catch(() => {
          setLoading(false); // Error occurred
        });
    } else {
      setLoading(false); // No user ID found
    }
  }, []);

  const scopesParam = searchParams?.scopes;
  const scopes = Array.isArray(scopesParam)
    ? scopesParam
    : scopesParam
    ? [scopesParam]
    : [];

  if (loading) {
    // Show skeleton while loading
    return (
      <div className="p-4 px-10">
        <PageHeader title="AI-Curated Farm Management Recommendations" />
        <RecommendationSkeleton /> {/* Skeleton loader */}
      </div>
    );
  }

  if (!userId) {
    return <div>Error: User ID is required.</div>;
  }

  if (!metrics) {
    return <div>Error fetching metrics.</div>;
  }

  return (
    <div className="p-4 px-10">
      <PageHeader title="AI-Curated Farm Management Recommendations" />
      <RecommendationClient
        userId={userId}
        initialMetrics={metrics}
        initialCategory={CategoryType.OVERALL}
        initialScopes={scopes}
        weatherData={weatherData}
      />
    </div>
  );
};

export default RecommendationPage;
