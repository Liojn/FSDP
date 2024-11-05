"use client";

import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";

const AchievementCard = ({ achievement }) => (
  <Card className={`relative p-6 rounded-xl border ${
    achievement.isUnlocked 
      ? 'bg-white border-lime-400' 
      : 'bg-gray-50 border-gray-200'
  }`}>
    <div className="flex items-center justify-between mb-4">
      <div className="w-12 h-12 rounded-full bg-lime-300 flex items-center justify-center">
        {/* Default icon placeholder */}
        <div className="w-6 h-6 bg-lime-600 rounded-full"></div>
      </div>
      {achievement.isUnlocked && (
        <span className="text-xs font-medium text-lime-600">
          Unlocked {new Date(achievement.dateUnlocked).toLocaleDateString()}
        </span>
      )}
    </div>
    
    <h3 className={`text-lg font-semibold mb-2 ${
      achievement.isUnlocked 
        ? 'text-lime-900' 
        : 'text-gray-600'
    }`}>
      {achievement.title}
    </h3>
    
    <p className={`text-sm mb-4 ${
      achievement.isUnlocked 
        ? 'text-lime-700' 
        : 'text-gray-500'
    }`}>
      {achievement.description}
    </p>
    
    <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
      <div 
        className={`absolute left-0 top-0 h-full rounded-full ${
          achievement.isUnlocked ? 'bg-lime-500' : 'bg-gray-400'
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
  const [achievements, setAchievements] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const categories = ["ALL", "Energy", "Waste", "Carbon", "Equipment", "Crop", "Livestock"];

  const fetchAndCombineData = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem("userId");
      
      if (!userId) {
        throw new Error("No user ID found in local storage");
      }

      // Fetch all badges first
      const badgesResponse = await fetch('/api/badges');
      if (!badgesResponse.ok) {
        throw new Error(`HTTP error fetching badges! status: ${badgesResponse.status}`);
      }
      const badgesData = await badgesResponse.json();

      // Fetch user's achievement progress
      const achievementsResponse = await fetch(`/api/badges/achivements/${userId}`);
      if (!achievementsResponse.ok) {
        throw new Error(`HTTP error fetching achievements! status: ${achievementsResponse.status}`);
      }
      const achievementsData = await achievementsResponse.json();

      // Combine the data
      const combinedAchievements = achievementsData.map(achievement => {
        // Find the corresponding badge details
        const badgeDetails = badgesData.find(badge => 
          badge._id.toString() === achievement.badge_id.toString()
        );
        
        return {
          ...achievement,
          title: badgeDetails?.title || 'Unknown Badge',
          description: badgeDetails?.description || 'No description available',
          category: badgeDetails?.category || 'Uncategorized',
          progress: achievement.progress || 0,
          isUnlocked: achievement.isUnlocked || false,
          dateUnlocked: achievement.dateUnlocked || null
        };
      });

      setAchievements(combinedAchievements);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAndCombineData();
  }, []);

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
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-lime-900">Achievements</h2>
        <div className="flex items-center space-x-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-white border border-lime-500 rounded-md p-2 text-lime-700"
          >
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Badges", value: achievements.length },
          { label: "Unlocked", value: achievements.filter(a => a.isUnlocked).length },
          { label: "In Progress", value: achievements.filter(a => !a.isUnlocked).length }
        ].map((stat, index) => (
          <div key={index} className="bg-white p-4 rounded-lg border border-lime-200">
            <div className="text-sm text-lime-600">{stat.label}</div>
            <div className="text-2xl font-bold text-lime-900">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto pb-6">
        {filteredAchievements.map(achievement => (
          <AchievementCard 
            key={achievement._id} 
            achievement={achievement} 
          />
        ))}
      </div>

      {filteredAchievements.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-500">No achievements found for this category.</p>
        </div>
      )}
    </div>
  );
};

export default AchievementsPage;