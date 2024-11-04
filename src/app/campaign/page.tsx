"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "@/hooks/use-toast";
import {
  CampaignData,
  CompanyFormValues,
  ParticipationFormValues,
} from "./types";
import { PageHeader } from "@/components/shared/page-header";
import { CampaignProgress } from "./components/CampaignProgress";
import { CampaignMilestones } from "./components/CampaignMilestones";
import { JoinCampaignForm } from "./components/JoinCampaignForm";
import { CompanyParticipation } from "./components/CompanyParticipation";
import { ParticipantsTable } from "./components/ParticipantsTable";
import { CompanyParticipationProps } from "./components/CompanyParticipation";
import { Card } from "@/components/ui/card";

export default function CampaignPage() {
  const [campaignData, setCampaignData] = useState<CampaignData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasJoined, setHasJoined] = useState(false);
  const [userCompany, setUserCompany] = useState<
    CompanyParticipationProps["company"] | null
  >(null);
  const [, setUserName] = useState<string>("");

  useEffect(() => {
    // Fetch campaign data and check user participation
    const fetchData = async () => {
      try {
        const [campaignResponse, userResponse] = await Promise.all([
          fetch("/api/campaign"),
          fetch("/api/user/campaign-status", {
            headers: {
              "user-email": localStorage.getItem("userEmail") || "",
            },
          }),
        ]);

        if (!campaignResponse.ok) {
          throw new Error("Failed to fetch campaign data");
        }

        const campaignData = await campaignResponse.json();
        setCampaignData(campaignData);

        if (userResponse.ok) {
          const userData = await userResponse.json();
          if (userData.hasJoined) {
            setHasJoined(true);
            setUserCompany(userData.company);
          }
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "An unexpected error occurred";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    // Only run if we're in the browser
    if (typeof window !== "undefined") {
      fetchData();
    }

    // Set up WebSocket connection for real-time updates
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

  useEffect(() => {
    // Access localStorage inside useEffect
    const storedUserName = localStorage.getItem("userName");
    if (storedUserName) {
      setUserName(storedUserName);
      // If you're using form.setValue, make sure to check if it's available
    }
  }, []);

  const onSubmit = async (
    companyValues: CompanyFormValues,
    participationValues: ParticipationFormValues
  ) => {
    setSubmitting(true);
    try {
      const response = await fetch("/api/campaign/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          companyInfo: companyValues,
          targetReduction: participationValues.targetReduction,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to join campaign");
      }

      // Update campaign data with new participant
      setCampaignData((prevData) => {
        if (!prevData) return null;
        return {
          ...prevData,
          campaign: {
            ...prevData.campaign,
            totalReduction:
              prevData.campaign.totalReduction +
              participationValues.targetReduction,
            signeesCount: prevData.campaign.signeesCount + 1,
          },
          participants: [
            {
              company: data.company,
              participation: data.participation,
            },
            ...prevData.participants,
          ],
        };
      });

      toast({
        title: "Success",
        description: "Successfully joined the campaign!",
        className: "bg-green-100 border-green-200",
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";
      toast({
        title: "Error",
        description: errorMessage,
        className: "bg-red-100 border-red-200",
      });
    } finally {
      setSubmitting(false);
    }
  };

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
    <div className="container mx-auto px-4 py-8">
      <PageHeader title={campaignData.campaign.name} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <Card className="p-6">
            {" "}
            <CampaignProgress
              totalReduction={campaignData.campaign.totalReduction}
              targetReduction={campaignData.campaign.targetReduction}
              startDate={campaignData.campaign.startDate}
              endDate={campaignData.campaign.endDate}
              signeesCount={campaignData.campaign.signeesCount}
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

        {hasJoined && userCompany ? (
          <CompanyParticipation company={userCompany} />
        ) : (
          <JoinCampaignForm onSubmit={onSubmit} submitting={submitting} />
        )}
      </div>

      <ParticipantsTable
        participants={campaignData.participants.map((participant) => ({
          ...participant,
          participation: {
            ...participant.participation,
            joinedAt: new Date(
              participant.participation.joinedAt
            ).toISOString(),
          },
        }))}
      />
    </div>
  );
}
