"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";

interface Achievement {
  _id: string;
  title: string;
  description: string;
  category: string;
  progress: number;
  isUnlocked: boolean;
  dateUnlocked: string | null;
  badge_id: string;
}

interface CampaignMilestone {
  percentage: number;
  reached: boolean;
}

interface CampaignData {
  campaign: {
    _id: string;
    name: string;
    status: string;
    totalReduction: number;
    targetReduction: number;
    signeesCount: number;
    milestones: CampaignMilestone[];
  };
  participants: Array<{
    company: {
      _id: string;
      name: string;
      email: string;
    };
    participation: {
      _id: string;
      campaignId: string;
      companyId: string;
      joinedAt: string;
      currentProgress: number;
      lastUpdated: string;
    };
  }>;
}

const AchievementCard = ({ achievement }: { achievement: Achievement }) => (
  <Card
    className={`relative p-6 rounded-xl border ${
      achievement.isUnlocked
        ? "bg-white border-lime-400"
        : "bg-gray-50 border-gray-200"
    }`}
  >
    <div className="flex items-center justify-between mb-4">
      <div className="w-12 h-12 rounded-full bg-lime-300 flex items-center justify-center">
        <div className="w-6 h-6 bg-lime-600 rounded-full"></div>
      </div>
      {achievement.isUnlocked && (
        <span className="text-xs font-medium text-lime-600">
          Unlocked {new Date(achievement.dateUnlocked!).toLocaleDateString()}
        </span>
      )}
      {achievement.category === "Campaign" && (
        <span className="text-xs font-medium text-blue-600">
          Campaign Milestone
        </span>
      )}
    </div>

    <h3 className="font-bold text-lg">{achievement.title}</h3>
    <p className="text-gray-600 text-sm">{achievement.description}</p>
    <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
      <div
        className={`absolute left-0 top-0 h-full rounded-full ${
          achievement.isUnlocked ? "bg-lime-500" : "bg-gray-400"
        }`}
        style={{ width: `${achievement.progress}%` }}
      ></div>
    </div>
    <span className="text-xs font-medium text-gray-600 mt-2 inline-block">
      {achievement.progress}% Complete
    </span>
  </Card>
);

const AchievementsPage = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastCalculated, setLastCalculated] = useState<Date | null>(null);
  const [isParticipant, setIsParticipant] = useState(false);

  const FETCH_INTERVAL = 10000;
  const CALCULATION_INTERVAL = 300000;

  const categories = [
    "ALL",
    "Energy",
    "Waste",
    "Carbon",
    "Equipment",
    "Crop",
    "Livestock",
  ];

  const checkCampaignParticipation = useCallback((
    campaignData: CampaignData,
    userEmail: string
  ): boolean => {
    if (!campaignData?.participants) {
      return false;
    }
    return campaignData.participants.some(
      (participant) =>
        participant.company.email.toLowerCase() === userEmail.toLowerCase()
    );
  }, []);

  const calculateBadges = useCallback(async () => {
    try {
      const userId = localStorage.getItem("userId");

      if (!userId) {
        throw new Error("No user ID found in local storage");
      }

      const response = await fetch("/api/badges/calculate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        throw new Error(`Failed to calculate badges: ${response.statusText}`);
      }

      setLastCalculated(new Date());
    } catch (err: any) {
      console.error("Error calculating badges:", err);
      setError(err.message);
    }
  }, []);

  const fetchAndCombineData = useCallback(async () => {
    try {
      const userId = localStorage.getItem("userId");
      const userEmail = localStorage.getItem("userEmail");

      if (!userId || !userEmail) {
        throw new Error("User ID or email not found in local storage");
      }

      const [badgesResponse, achievementsResponse, campaignResponse] =
        await Promise.all([
          fetch("/api/badges"),
          fetch(`/api/badges/achivements/${userId}`),
          fetch("/api/campaign"),
        ]);

      if (
        !badgesResponse.ok ||
        !achievementsResponse.ok ||
        !campaignResponse.ok
      ) {
        throw new Error("Failed to fetch data");
      }

      const [badgesData, achievementsData, campaignData] = await Promise.all([
        badgesResponse.json(),
        achievementsResponse.json(),
        campaignResponse.json(),
      ]);

      const userIsParticipant = checkCampaignParticipation(
        campaignData,
        userEmail
      );
      setIsParticipant(userIsParticipant);

      // Map user achievements and badges data
      const badgeMap = new Map();
      achievementsData.userBadges.forEach((userBadge: any) => {
        const badgeDetails = badgesData.find(
          (badge: any) => badge._id === userBadge.badge_id
        );
        if (badgeDetails && !badgeMap.has(userBadge.badge_id)) {
          badgeMap.set(userBadge.badge_id, {
            ...userBadge,
            title: badgeDetails.title || "Unknown Badge",
            description: badgeDetails.description || "No description available",
            category: badgeDetails.category || "Uncategorized",
            progress: userBadge.progress || 0,
            isUnlocked: userBadge.isUnlocked || false,
            dateUnlocked: userBadge.dateUnlocked || null,
          });
        }
      });

      if (userIsParticipant && campaignData?.campaign?.milestones) {
        campaignData.campaign.milestones.forEach(
          (milestone: CampaignMilestone) => {
            badgeMap.set(`milestone-${milestone.percentage}`, {
              _id: `milestone-${milestone.percentage}`,
              title: `Campaign Milestone ${milestone.percentage}%`,
              description: `Achieve ${milestone.percentage}% of target reduction`,
              category: "Campaign",
              progress: milestone.reached ? 100 : 0,
              isUnlocked: milestone.reached,
              dateUnlocked: milestone.reached ? new Date().toISOString() : null,
              badge_id: `milestone-${milestone.percentage}`,
            });
          }
        );
      }

      const combinedAchievements = Array.from(badgeMap.values());
      setAchievements(combinedAchievements);
      setError(null);
    } catch (err: any) {
      console.error("Error fetching data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [checkCampaignParticipation]);

  useEffect(() => {
    const init = async () => {
      await calculateBadges();
      await fetchAndCombineData();
    };
    init();

    const fetchInterval = setInterval(fetchAndCombineData, FETCH_INTERVAL);
    const calculationInterval = setInterval(calculateBadges, CALCULATION_INTERVAL);

    return () => {
      clearInterval(fetchInterval);
      clearInterval(calculationInterval);
    };
  }, [calculateBadges, fetchAndCombineData]);

  const filteredAchievements = achievements.filter(
    (achievement) => filter === "ALL" || achievement.category === filter
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="p-4 h-screen flex flex-col space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-lime-900">Achievements</h2>
          {lastCalculated && (
            <p className="text-sm text-gray-500">
              Last calculated: {lastCalculated.toLocaleTimeString()}
            </p>
          )}
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="bg-white border border-lime-500 rounded-md p-2 text-lime-700"
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: "Total Badges",
            value: achievements.length,
          },
          {
            label: "Unlocked",
            value: achievements.filter((a) => a.isUnlocked).length,
          },
          {
            label: "In Progress",
            value: achievements.filter((a) => !a.isUnlocked).length,
          },
        ].map((stat, index) => (
          <div
            key={index}
            className="bg-white p-4 rounded-lg border border-lime-200"
          >
            <div className="text-sm text-lime-600">{stat.label}</div>
            <div className="text-2xl font-bold text-lime-900">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredAchievements.map((achievement) => (
          <AchievementCard key={achievement._id} achievement={achievement} />
        ))}
      </div>
    </div>
  );
};

export default AchievementsPage;