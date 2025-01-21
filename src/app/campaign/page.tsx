"use client";

import { useEffect, useState } from "react";
import { CampaignData } from "./types";
import { PageHeader } from "@/components/shared/page-header";
import { CampaignProgress } from "./components/CampaignProgress";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// Loading skeleton component for better UX
const CampaignSkeleton = () => {
  return (
    <div className="container mx-auto px-4 pb-8 space-y-6">
      <div className="space-y-3">
        <Skeleton className="h-10 w-[250px]" />
        <Skeleton className="h-4 w-[300px]" />
      </div>

      <Card className="p-6">
        <div className="space-y-8">
          {/* Progress bar skeleton */}
          <div className="space-y-4">
            <Skeleton className="h-4 w-[200px]" />
            <Skeleton className="h-8 w-full" />
            <div className="flex justify-between">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-4 w-[100px]" />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default function CampaignPage() {
  const [campaignData, setCampaignData] = useState<CampaignData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch campaign data with progressive enhancement
  const fetchCampaignData = async () => {
    try {
      const campaignResponse = await fetch("/api/campaign", {
        next: { revalidate: 60 }, // Cache for 60 seconds
      });
      if (!campaignResponse.ok) {
        throw new Error("Failed to fetch campaign data");
      }
      const campaignJson = await campaignResponse.json();
      setCampaignData(campaignJson);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Start fetching data immediately
      fetchCampaignData();

      // Setup WebSocket connection for real-time updates
      const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const ws = new WebSocket(
        `${wsProtocol}//${window.location.host}/api/campaign/ws`
      );

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        setCampaignData((prevData) => {
          if (!prevData) return null;
          return {
            ...prevData,
            campaign: {
              ...prevData.campaign,
              totalReduction: data.totalReduction,
              milestones: data.milestones,
            },
          };
        });
      };

      return () => {
        ws.close();
      };
    }
  }, []);

  if (loading) {
    return <CampaignSkeleton />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-600">
        Error: {error}
      </div>
    );
  }

  if (!campaignData) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-600">
        No campaign data available
      </div>
    );
  }

  return (
    <div className="mx-auto px-4 pb-8">
      <PageHeader title={campaignData.campaign.name} />

      <div className="">
        <Card className="p-6">
          <CampaignProgress
            currentProgress={campaignData.campaign.currentProgress}
            targetReduction={campaignData.campaign.targetReduction}
            startDate={campaignData.campaign.startDate}
            endDate={campaignData.campaign.endDate}
          />
        </Card>
      </div>
    </div>
  );
}
