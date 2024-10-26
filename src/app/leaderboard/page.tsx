"use client"; // treat this component as a Client Component

import React from "react";

const leaderboardData = [
  { name: "EcoFarm", score: 95 },
  { name: "GreenCo", score: 88 },
  { name: "SustainInc", score: 84 },
  { name: "BioWorks", score: 78 },
  { name: "EcoGrow", score: 72 },
  { name: "GreenFarm", score: 65 },
];

const DashboardPage = () => {
  return (
    <div className="p-4 grid grid-cols-1 md:grid-cols-4 gap-6">
      {/* Leaderboard Section - spans 3 columns on larger screens */}
      <div className="md:col-span-3 space-y-6">
        {/* Leaderboard Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Leaderboard for</h2>
          <button className="text-blue-500 hover:underline">Today ⬇️</button>
        </div>

        {/* Top 3 Section */}
        <div className="grid grid-cols-3 gap-4">
          {["Top 1", "Top 2", "Top 3"].map((title, index) => (
            <div
              key={index}
              className="bg-gray-200 p-6 flex justify-center items-center rounded-lg"
            >
              {title}
            </div>
          ))}
        </div>

        {/* Other Companies Section */}
        <h3 className="text-lg font-semibold mt-6">Other companies</h3>
        <ul className="space-y-4">
          {leaderboardData.map((company, index) => (
            <li
              key={index}
              className="bg-gray-100 p-4 rounded-lg flex justify-between items-center"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-400 rounded-full"></div>
                <span className="font-medium text-gray-700">{company.name}</span>
              </div>
              <span className="text-gray-600">Score: {company.score}%</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Campaign Progress Section - occupies 1 column on larger screens */}
      <div className="bg-white p-4 shadow-md rounded-lg space-y-4">
        <h3 className="text-lg font-semibold">Reduce Carbon Emissions Campaign</h3>
        <div className="flex flex-col items-center mt-4">
          <div className="text-5xl font-bold text-pink-500">86%</div>
          <p className="text-gray-600 mt-2">Top 5 Contributors</p>
          <ul className="mt-4 space-y-2">
            {leaderboardData.slice(0, 5).map((contributor, index) => (
              <li key={index} className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-gray-400 rounded-full"></div>
                  <span>{contributor.name}</span>
                </div>
                <span className="text-gray-600">Score: {contributor.score}%</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
