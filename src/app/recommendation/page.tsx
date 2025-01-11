/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import RecommendationClient from "./recommendation-client";
import { CategoryType } from "@/types";
import { PageHeader } from "@/components/shared/page-header";

export const dynamic = "force-dynamic";

const RecommendationPage = ({
  searchParams,
}: {
  searchParams?: { scopes?: string | string[] };
}) => {
  const [userId, setUserId] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<any>(null);
  const [weatherData, setWeatherData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    if (storedUserId) {
      setUserId(storedUserId);

      fetch(`/api/recommendation/data/${storedUserId}`)
        .then((response) => response.json())
        .then((fetchedData) => {
          setMetrics(fetchedData.metrics);
          setWeatherData(fetchedData.weatherData);
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const scopesParam = searchParams?.scopes;
  const scopes = Array.isArray(scopesParam)
    ? scopesParam
    : scopesParam
    ? [scopesParam]
    : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
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
        userId={userId} // Add this property
        initialMetrics={metrics}
        initialCategory={CategoryType.OVERALL}
        initialScopes={scopes}
        weatherData={weatherData}
      />
    </div>
  );
};

export default RecommendationPage;
