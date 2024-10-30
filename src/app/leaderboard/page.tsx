"use client";

import { PageHeader } from "@/components/shared/page-header";
import React, { useState } from "react";

// Expanded leaderboard data with more companies
const leaderboardData = [
  { name: "EcoFarm", score: 95 },
  { name: "GreenCo", score: 88 },
  { name: "SustainInc", score: 84 },
  { name: "BioWorks", score: 78 },
  { name: "EcoGrow", score: 72 },
  { name: "GreenFarm", score: 65 },
  { name: "EarthWise", score: 60 },
  { name: "NatureNet", score: 58 },
  { name: "PlanetRoots", score: 55 },
  { name: "EnviroTrust", score: 53 },
  { name: "EcoLogic", score: 50 },
  { name: "GreenLeaf", score: 48 },
];

const DashboardPage = () => {
  const [filter, setFilter] = useState("Today");
  const [dataFilter, setDataFilter] = useState("Energy Consumption");

  const handleFilterChange = (event: {
    target: { value: React.SetStateAction<string> };
  }) => {
    setFilter(event.target.value);
    // Add logic here to update leaderboardData based on the selected filter
  };

  const handleDataFilterChange = (event: {
    target: { value: React.SetStateAction<string> };
  }) => {
    setDataFilter(event.target.value);
    // Add logic here to update data based on the selected data filter
  };

  return (
    <div className="p-4 grid grid-cols-1 md:grid-cols-4 gap-6 h-screen">
      {/* Leaderboard Section - spans 3 columns on larger screens */}
      <div className="md:col-span-3 flex flex-col space-y-6 h-full">
        {/* Leaderboard Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <PageHeader title="Leaderboard for" />
            <select
              value={filter}
              onChange={handleFilterChange}
              className="bg-white border border-gray-300 rounded-md p-2 text-gray-700"
            >
              <option value="Today">Today</option>
              <option value="Yesterday">Yesterday</option>
              <option value="Last 7 Days">Last 7 Days</option>
              <option value="Last Month">Last Month</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-semibold">Data:</span>
            <select
              value={dataFilter}
              onChange={handleDataFilterChange}
              className="bg-white border border-gray-300 rounded-md p-2 text-gray-700"
            >
              <option value="Carbon Emissions">Carbon Emissions</option>
              <option value="Energy Consumption">Energy Consumption</option>
            </select>
          </div>
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
        <div
          className="bg-gray-100 p-4 rounded-lg flex-grow overflow-y-auto custom-scrollbar"
          style={{ maxHeight: "600px" }}
        >
          <ul className="space-y-4">
            {leaderboardData.map((company, index) => (
              <li
                key={index}
                className="bg-white p-4 rounded-lg flex justify-between items-center"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-400 rounded-full"></div>
                  <span className="font-medium text-gray-700">
                    {company.name}
                  </span>
                </div>
                <span className="text-gray-600">Score: {company.score}%</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Campaign Progress Section - occupies 1 column on larger screens */}
      <div className="bg-white p-4 shadow-md rounded-lg flex flex-col justify-between space-y-4">
        <h3 className="text-lg font-semibold">
          Reduce Carbon Emissions Campaign
        </h3>

        {/* Progress Display */}
        <div className="flex flex-col items-center mt-4">
          <div className="text-5xl font-bold text-pink-500">86%</div>
          <p className="text-gray-600 mt-2">Top 5 Contributors</p>
        </div>

        {/* Top 5 Contributors */}
        <ul className="space-y-4 flex-grow">
          {leaderboardData.slice(0, 5).map((contributor, index) => (
            <li
              key={index}
              className="bg-gray-100 p-4 rounded-lg flex flex-col space-y-2"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-400 rounded-full"></div>
                  <span>{contributor.name}</span>
                </div>
                <span className="text-gray-600">{contributor.score}%</span>
              </div>
              {/* Progress Bar */}
              <div className="w-full bg-gray-300 h-2 rounded-full">
                <div
                  className="bg-pink-500 h-2 rounded-full"
                  style={{ width: `${contributor.score}%` }}
                ></div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default DashboardPage;
