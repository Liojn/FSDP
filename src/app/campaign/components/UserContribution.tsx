// components/UserContribution.tsx
"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { MetricCard } from "@/components/shared/metric-card"; // Ensure the path is correct
import { User, Campaign } from "@/types";
import { Trees, Percent } from "lucide-react"; // Import Lucide icons

interface UserContributionProps {
  user: User;
  campaign: Campaign;
}

export default function UserContribution({
  user,
  campaign,
}: UserContributionProps) {
  // Ensure userId matches if needed
  const userContribution = user.totalContributions || 0;
  const totalCampaignTarget = campaign.targetReduction;

  const userContributionPercentage = totalCampaignTarget
    ? (userContribution / totalCampaignTarget) * 100
    : 0;

  return (
    <Card className="p-6 mt-4">
      <h2 className="text-xl font-bold mb-4">Your Contribution</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <MetricCard
          title="Total Contribution"
          value={userContribution}
          unit="(kg CO₂e)"
          icon={<Trees className="text-green-500 w-6 h-6" />} // Lucide Tree Icon
        />
        <MetricCard
          title="Your Percentage of Goal Contribution"
          value={`${userContributionPercentage.toFixed(2)}%`}
          unit={`of ${totalCampaignTarget.toLocaleString()} (kg CO₂e)`}
          icon={<Percent className="text-blue-500 w-6 h-6" />} // Lucide Percent Icon
        />
      </div>
    </Card>
  );
}
