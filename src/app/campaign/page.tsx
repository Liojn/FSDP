"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { CampaignData } from "./types";
import { PageHeader } from "@/components/shared/page-header";
import { CampaignProgress } from "./components/CampaignProgress";
import { CampaignMilestones } from "./components/CampaignMilestones";
import { CompanyParticipationProps } from "./components/CompanyParticipation";
import { Card } from "@/components/ui/card";

export default function CampaignPage() {
  const [campaignData, setCampaignData] = useState<CampaignData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // This will hold the current user's company info if they are logged in
  const [] = useState<CompanyParticipationProps["company"] | null>(null);

  // Fetch campaign data (and the user’s company data) from your API
  const fetchCampaignData = async () => {
    try {
      // 1. Fetch campaign details
      const campaignResponse = await fetch("/api/campaign");
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
      fetchCampaignData();
    }

    // Optional: Real-time updates via WebSocket
    const ws = new WebSocket(
      `${window.location.protocol === "https:" ? "wss:" : "ws:"}//${
        window.location.host
      }/api/campaign/ws`
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
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-lime-600" />
      </div>
    );
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
    <div className="container mx-auto px-4 pb-8">
      <PageHeader title={campaignData.campaign.name} />

      <div className="">
        {/* Campaign Progress + Milestones */}
        <div>
          <Card className="p-6">
            <CampaignProgress
              currentProgress={campaignData.campaign.currentProgress}
              targetReduction={campaignData.campaign.targetReduction}
              startDate={campaignData.campaign.startDate}
              endDate={campaignData.campaign.endDate}
            />
            <CampaignMilestones
              milestones={campaignData.campaign.milestones.map((milestone) => ({
                ...milestone,
                reachedAt: milestone.reachedAt
                  ? milestone.reachedAt.toISOString()
                  : undefined,
              }))}
            />
          </Card>
        </div>
      </div>
    </div>
  );
}
