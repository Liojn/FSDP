"use client";

import React, { useEffect, useState, Suspense } from "react";

// Type Definitions
import { CampaignAPIResponse } from "@/types";

// Static Imports for Lightweight Components
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/shared/page-header";
import { Card } from "@/components/ui/card";

// Dynamic Imports for Heavy Components
const CampaignProgress = React.lazy(
  () => import("./components/CampaignProgress")
);
const UserContribution = React.lazy(
  () => import("./components/UserContribution")
);

// CampaignSkeleton Component (Remains Static)
const CampaignSkeleton = () => {
  return (
    <div className="container mx-auto px-4 pb-8 space-y-6 animate-pulse">
      <Card className="p-6">
        <div className="space-y-8">
          {/* Progress section */}
          <div className="space-y-4">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-2 w-full rounded-full" />
            <div className="flex justify-between text-sm text-muted-foreground">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>

          {/* Milestones section */}
          <div className="space-y-4">
            <Skeleton className="h-4 w-32" />
            <div className="grid gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* User contribution skeleton */}
      <Card className="p-6">
        <div className="space-y-4">
          <Skeleton className="h-4 w-40" />
          <div className="flex gap-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default function CampaignPage() {
  const [campaignData, setCampaignData] = useState<CampaignAPIResponse | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch Campaign Data
  const fetchCampaignData = async (userId: string) => {
    try {
      const response = await fetch(`/api/campaign?userId=${userId}`, {
        next: { revalidate: 60 },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch campaign data");
      }

      const data: CampaignAPIResponse = await response.json();
      setCampaignData(data);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  // Preload User Data on Mount
  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    if (storedUserId) {
      fetchCampaignData(storedUserId);
    } else {
      setError("User ID not found in localStorage.");
      setLoading(false);
    }
  }, []);

  // WebSocket Setup for Real-time Updates
  useEffect(() => {
    if (!campaignData) return;

    const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const ws = new WebSocket(
      `${wsProtocol}//${window.location.host}/api/campaign/ws`
    );

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setCampaignData((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          campaign: {
            ...prev.campaign,
            totalReduction: data.totalReduction,
            milestones: data.milestones,
          },
        };
      });
    };

    return () => ws.close();
  }, [campaignData]);

  // Render Loading Skeleton
  if (loading) {
    return <CampaignSkeleton />;
  }

  // Render Error State
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-600">
        Error: {error}
      </div>
    );
  }

  // Render No Data State
  if (!campaignData) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-600">
        No campaign data available
      </div>
    );
  }

  // Main Campaign Content with Lazy Loaded Components
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Skeleton className="h-10 w-60" />
        </div>
      }
    >
      <div className="mx-auto px-4 pb-8">
        {/* Page Header */}
        <Suspense fallback={<Skeleton className="h-10 w-60 mb-6" />}>
          <PageHeader title={campaignData.campaign.name} />
        </Suspense>

        {/* Campaign Progress */}
        <Card className="p-6">
          <Suspense fallback={<Skeleton className="h-20 w-full" />}>
            <CampaignProgress
              currentProgress={campaignData.campaign.currentProgress}
              targetReduction={campaignData.campaign.targetReduction}
              startDate={campaignData.campaign.startDate ?? new Date()}
              endDate={campaignData.campaign.endDate ?? new Date()}
            />
          </Suspense>
        </Card>

        {/* User Contribution */}
        <Suspense fallback={<Skeleton className="h-20 w-full mt-6" />}>
          <UserContribution
            user={campaignData.user}
            campaign={campaignData.campaign}
          />
        </Suspense>
      </div>
    </Suspense>
  );
}
