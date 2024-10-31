"use client";

import React, { useState } from 'react';

const achievementsData = [
  {
    id: 1,
    title: "Energy Pioneer",
    description: "Implemented solar panels across 50% of farm buildings",
    category: "Energy",
    progress: 75,
    isUnlocked: true,
    date: "2024-03-15"
  },
  {
    id: 2,
    title: "Waste Manager",
    description: "Achieved 90% waste recycling in farm operations",
    category: "Waste",
    progress: 100,
    isUnlocked: true,
    date: "2024-02-28"
  },
  {
    id: 3,
    title: "Carbon Champion",
    description: "Reduced farm's carbon footprint by 25%",
    category: "Carbon",
    progress: 60,
    isUnlocked: false,
    date: null
  },
  {
    id: 4,
    title: "Equipment Master",
    description: "Upgraded to energy-efficient machinery",
    category: "Equipment",
    progress: 45,
    isUnlocked: false,
    date: null
  },
  {
    id: 5,
    title: "Crop Innovator",
    description: "Implemented smart irrigation across all fields",
    category: "Crop",
    progress: 90,
    isUnlocked: true,
    date: "2024-03-20"
  },
  {
    id: 6,
    title: "Livestock Guardian",
    description: "Achieved optimal animal welfare standards",
    category: "Livestock",
    progress: 85,
    isUnlocked: true,
    date: "2024-03-10"
  },
  {
    id: 7,
    title: "Crop Rotation Master",
    description: "Successfully implemented 4-season crop rotation",
    category: "Crop",
    progress: 70,
    isUnlocked: false,
    date: null
  },
  {
    id: 8,
    title: "Energy Optimizer",
    description: "Reduced energy usage in storage facilities by 30%",
    category: "Energy",
    progress: 40,
    isUnlocked: false,
    date: null
  },
  {
    id: 9,
    title: "Livestock Nutrition Pro",
    description: "Optimized feed efficiency by 20%",
    category: "Livestock",
    progress: 95,
    isUnlocked: true,
    date: "2024-03-25"
  },
  {
    id: 10,
    title: "Equipment Efficiency",
    description: "Maintained perfect equipment maintenance schedule",
    category: "Equipment",
    progress: 80,
    isUnlocked: true,
    date: "2024-03-18"
  },
  {
    id: 11,
    title: "Waste Reducer",
    description: "Implemented composting for all organic waste",
    category: "Waste",
    progress: 65,
    isUnlocked: false,
    date: null
  },
  {
    id: 12,
    title: "Carbon Sequestration",
    description: "Increased soil carbon content by 15%",
    category: "Carbon",
    progress: 50,
    isUnlocked: false,
    date: null
  }
];

const AchievementsPage = () => {
  const [filter, setFilter] = useState("ALL");
  const categories = ["ALL", "Energy", "Waste", "Carbon", "Equipment", "Crop", "Livestock"];

  const filteredAchievements = achievementsData.filter(achievement => 
    filter === "ALL" || achievement.category === filter
  );

  const AchievementCard = ({ achievement }) => (
    <div className={`relative p-6 rounded-xl border ${achievement.isUnlocked 
      ? 'bg-white border-lime-400' 
      : 'bg-gray-50 border-gray-200'}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 rounded-full bg-lime-300 flex items-center justify-center">
          {/* Icon placeholder - replace with actual icons */}
          <div className="w-6 h-6 bg-lime-600 rounded-full"></div>
        </div>
        {achievement.isUnlocked && (
          <span className="text-xs font-medium text-lime-600">
            Unlocked {achievement.date}
          </span>
        )}
      </div>
      
      <h3 className={`text-lg font-semibold mb-2 ${achievement.isUnlocked 
        ? 'text-lime-900' 
        : 'text-gray-600'}`}>
        {achievement.title}
      </h3>
      
      <p className={`text-sm mb-4 ${achievement.isUnlocked 
        ? 'text-lime-700' 
        : 'text-gray-500'}`}>
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
    </div>
  );

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
          { label: "Total Badges", value: achievementsData.length },
          { label: "Unlocked", value: achievementsData.filter(a => a.isUnlocked).length },
          { label: "In Progress", value: achievementsData.filter(a => !a.isUnlocked).length }
        ].map((stat, index) => (
          <div key={index} className="bg-white p-4 rounded-lg border border-lime-200">
            <div className="text-sm text-lime-600">{stat.label}</div>
            <div className="text-2xl font-bold text-lime-900">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Achievements Grid - Updated to hide scrollbar */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto pb-6 scrollbar-hide">
        <style jsx global>{`
          .scrollbar-hide {
            -ms-overflow-style: none;  /* IE and Edge */
            scrollbar-width: none;     /* Firefox */
          }
          .scrollbar-hide::-webkit-scrollbar {
            display: none;             /* Chrome, Safari and Opera */
          }
        `}</style>
        {filteredAchievements.map(achievement => (
          <AchievementCard key={achievement.id} achievement={achievement} />
        ))}
      </div>
    </div>
  );
};

export default AchievementsPage;