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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Retrieve userId from localStorage
    const storedUserId = localStorage.getItem("userId");
    if (storedUserId) {
      setUserId(storedUserId);

      // Fetch metrics from the API if userId exists
      fetch(`/api/recommendation/data/${storedUserId}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error("Error fetching metrics.");
          }
          return response.json();
        })
        .then((data) => {
          setMetrics(data);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Failed to fetch metrics:", error);
          setLoading(false);
        });
    } else {
      setLoading(false); // Stop loading if no userId is found
    }
  }, []);

  // Handle scopes from query parameters
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
        initialMetrics={metrics}
        initialCategory={CategoryType.OVERALL}
        initialScopes={scopes}
      />
    </div>
  );
};

export default RecommendationPage;
