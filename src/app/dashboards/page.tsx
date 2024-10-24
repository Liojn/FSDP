"use client"; //treat this component as a Client Component

import React, { useState } from 'react';

const LineChart = () => <div className="bg-gray-200 h-full flex justify-center items-center">Line graph</div>;

//Fake data for metrics and leaderboard
const metricsData = [
    { title: "Total Carbon Emissions", value: "1234.56", unit: "KG CO2" },
    { title: "Total Fuel Consumption", value: "23", unit: "Litres" },
    { title: "Total Energy Consumption", value: "2344", unit: "kWh" }
];
  
const leaderboardData = [
    { name: "EcoFarm", score: 95 },
    { name: "EcoFarm", score: 95 },
    { name: "EcoFarm", score: 95 },
    { name: "EcoFarm", score: 95 },
    { name: "EcoFarm", score: 95 },
    { name: "EcoFarm", score: 95 },
    { name: "EcoFarm", score: 95 }
];


const AdditionalGraph = () => (
  <div className="bg-white p-4 shadow-md rounded-lg h-56 flex flex-col"> 
    <h3 className="text-lg font-semibold text-gray-700 mb-4 flex-shrink-0">Overall Pie Chart Graph</h3>
    <div className="flex-1 flex flex-col">
      <div className="bg-gray-300 flex-1 flex justify-center items-center pb-4">Your Graph Here</div>
    </div>
  </div>
);
  
  const DashboardPage = () => {
    const [filter, setFilter] = useState(false);
  
    return (
      <div className="p-4 space-y-6">
        {/* Dashboard Header */}
        <div className="flex justify-between items-center mb-4">
          <div className="text-xl font-bold">Dashboard</div>
          <button className="text-blue-500 hover:underline">Filter</button>
        </div>
  
        {/* Dashboard Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column: Metrics and Charts */}
          <div className="md:col-span-2 space-y-6">
            {/* Dashboard Cards for Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {metricsData.map((metric, index) => (
                <div key={index} className="bg-white p-4 shadow-md rounded-lg flex flex-col items-center">
                  <h3 className="text-lg font-semibold text-gray-700">{metric.title}</h3>
                  <div className="text-4xl font-bold mt-2">{metric.value}</div>
                  <div className="text-gray-500">{metric.unit}</div>
                </div>
              ))}
            </div>
  
            {/* Line Chart: */}
            <div className="bg-white p-4 shadow-md rounded-lg">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">
                Carbon Emission Trend/Fuel Consumption Trend/Energy Consumption Trend
              </h3>
              <div className="h-96"> {/* Adjusted to occupy more space */}
                <LineChart />
              </div>
            </div>
          </div>
  
          {/* Right Column: Leaderboard with Additional Graph */}
          <div className="flex flex-col space-y-6 ">
            {/* Increased Additional Graph */}
            <AdditionalGraph />
  
            {/* Leaderboard */}
            <div className="bg-white p-4 shadow-md rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-700">Leaderboard</h3>
              <a href="#" className="text-blue-600 hover:text-blue-800 text-sm">View All</a>
            </div>
              <ul className="space-y-4">
                {leaderboardData.map((entry, index) => (
                  <li key={index} className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                      <span className="font-medium text-gray-600">{entry.name}</span>
                    </div>
                    <span className="text-gray-600">Score: {entry.score}%</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  export default DashboardPage;