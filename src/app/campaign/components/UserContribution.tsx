// components/UserContribution.tsx
"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { User, Campaign } from "@/types";

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
      <p className="text-gray-700">
        <strong>Total Contribution:</strong> {userContribution.toLocaleString()}{" "}
        tons
      </p>
      <p className="text-gray-700 mt-2">
        <strong>Percentage of Goal:</strong>{" "}
        {userContributionPercentage.toFixed(2)}% of the{" "}
        {totalCampaignTarget.toLocaleString()} tons target
      </p>
    </Card>
  );
}
