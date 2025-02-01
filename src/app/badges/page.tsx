/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { Coins, Check } from "lucide-react";

interface Achievement {
  _id: string;
  title: string;
  description: string;
  category: string;
  progress: number;
  isUnlocked: boolean;
  dateUnlocked: string | null;
  badge_id: string;
  credits: number;
  creditsAwarded: boolean;
}

const AchievementCard = ({ 
  achievement, 
  onClaimCredits 
}: { 
  achievement: Achievement;
  onClaimCredits: (badgeId: string) => Promise<void>;
}) => {
  const [claiming, setClaiming] = useState(false);

  const handleClaim = async () => {
  try {
    setClaiming(true);
    await onClaimCredits(achievement.badge_id);
  } catch (error: any) {
    console.error("Error claiming credits:", error);
    alert(`Error claiming credits: ${error.message}`);
  } finally {
    setClaiming(false);
  }
};

  return (
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
        <div className="flex flex-col items-end">
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
      </div>

      <h3 className="font-bold text-lg">{achievement.title}</h3>
      <p className="text-gray-600 text-sm mb-3">{achievement.description}</p>
      
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Coins className="w-4 h-4 text-lime-600" />
          <span className="text-sm font-medium">
            {achievement.credits} Credits
          </span>
        </div>
        
        {achievement.isUnlocked && achievement.creditsAwarded ? (
          <span className="flex items-center gap-1 text-sm text-lime-600">
            <Check className="w-4 h-4" /> Claimed
          </span>
        ) : achievement.isUnlocked ? (
          <Button
            size="sm"
            variant="outline"
            onClick={handleClaim}
            disabled={claiming}
            className="bg-lime-50 border-lime-200 text-lime-700 hover:bg-lime-100"
          >
            {claiming ? "Claiming..." : "Claim Credits"}
          </Button>
        ) : null}
      </div>

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
};

const AchievementsPage = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastCalculated, setLastCalculated] = useState<Date | null>(null);

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
    "Campaign"
  ];

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

const claimCredits = async (badgeId: string) => {
  try {
    const userId = localStorage.getItem("userId");
    if (!userId) throw new Error("No user ID found");

    const response = await fetch("/api/badges/claim", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId, badgeId }),
    });

    if (!response.ok) throw new Error("Failed to claim credits");

    const data = await response.json();
    
    // Ensure currentStoreCurrency is a valid number
    const currentStoreCurrency = Number(localStorage.getItem("storeCurrency") || 0);
    if (isNaN(currentStoreCurrency)) {
      throw new Error("Invalid store currency value in localStorage");
    }

    // Ensure creditsEarned is a valid number
    const creditsEarned = Number(data.creditsEarned);
    if (isNaN(creditsEarned)) {
      throw new Error("Invalid credits earned value from API");
    }

    const newStoreCurrency = currentStoreCurrency + creditsEarned;

    console.log("Current Store Currency:", currentStoreCurrency);
    console.log("Credits Earned:", creditsEarned);
    console.log("New Store Currency:", newStoreCurrency);

    // Update localStorage
    localStorage.setItem("storeCurrency", newStoreCurrency.toString());

    // Dispatch event to update sidebar
    window.dispatchEvent(new CustomEvent('updateStoreCurrency', { 
      detail: { 
        newStoreCurrency: newStoreCurrency,
        creditsEarned: creditsEarned 
      } 
    }));

    // Update local state for claimed badge
    setAchievements(prev => prev.map(achievement => 
      achievement.badge_id === badgeId 
        ? { ...achievement, creditsAwarded: true }
        : achievement
    ));

  } catch (error) {
    console.error("Error claiming credits:", error);
    throw error;
  }
};

  const fetchAndCombineData = useCallback(async () => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        throw new Error("User ID not found in local storage");
      }

      const [badgesResponse, achievementsResponse] = await Promise.all([
        fetch("/api/badges"),
        fetch(`/api/badges/achivements/${userId}`),
      ]);

      if (!badgesResponse.ok || !achievementsResponse.ok) {
        throw new Error("Failed to fetch data");
      }

      const [badgesData, achievementsData] = await Promise.all([
        badgesResponse.json(),
        achievementsResponse.json(),
      ]);

      const combinedAchievements = achievementsData.userBadges.map((userBadge: any) => {
        const badgeDetails = badgesData.find(
          (badge: any) => badge._id.toString() === userBadge.badge_id.toString()
        );
        return {
          ...userBadge,
          title: badgeDetails?.title || "Unknown Badge",
          description: badgeDetails?.description || "No description available",
          category: badgeDetails?.category || "Uncategorized",
          progress: userBadge.progress || 0,
          isUnlocked: userBadge.isUnlocked || false,
          dateUnlocked: userBadge.dateUnlocked || null,
          credits: badgeDetails?.credits || 0,
          creditsAwarded: userBadge.creditsAwarded || false
        };
      });

      setAchievements(combinedAchievements);
      setError(null);
    } catch (err: any) {
      console.error("Error fetching data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

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

  const totalPossibleCredits = achievements.reduce(
    (sum, achievement) => sum + achievement.credits,
    0
  );

  const earnedCredits = achievements.reduce(
    (sum, achievement) => sum + (achievement.creditsAwarded ? achievement.credits : 0),
    0
  );

  if (loading) {
    return (
      <div className="p-4 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-6 w-48 rounded-md" />
          <Skeleton className="h-4 w-32 rounded-md" />
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, index) => (
            <Skeleton key={index} className="h-16 w-full rounded-lg" />
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="p-4 space-y-4 bg-gray-100 rounded-lg">
              <Skeleton className="h-6 w-3/4 rounded-md" />
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
          ))}
        </div>
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
          <PageHeader title="Achievements" />
          {lastCalculated && (
            <p className="text text-gray-500">
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

      <div className="grid grid-cols-4 gap-4">
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
          {
            label: "Credits Earned",
            value: `${earnedCredits}/${totalPossibleCredits}`,
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
          <AchievementCard 
            key={achievement._id} 
            achievement={achievement}
            onClaimCredits={claimCredits}
          />
        ))}
      </div>
    </div>
  );
};

export default AchievementsPage;