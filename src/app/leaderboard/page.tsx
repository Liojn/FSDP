"use client";

import { PageHeader } from "@/components/shared/page-header";
import React, { useState, useEffect, useRef } from "react";
import { ChangeEvent } from "react";

// Define interfaces for data types
interface LeaderboardEntry {
  name: string;
  score: number;
}

// Type the leaderboard data
const leaderboardData: LeaderboardEntry[] = [
  { name: "EarthWise", score: 60 },
  { name: "NatureNet", score: 58 },
  { name: "PlanetRoots", score: 55 },
  { name: "EnviroTrust", score: 53 },
  { name: "EcoLogic", score: 50 },
  { name: "GreenLeaf", score: 48 },
];

// Define types for filter options
type FilterOption = "Today" | "This Week" | "This Month" | "This Year";
type DataFilterOption =
  | "Energy Consumption"
  | "Carbon Emissions"
  | "Water Usage";

const LeaderboardPage = () => {
  const [filter, setFilter] = useState<FilterOption>("Today");
  const [dataFilter, setDataFilter] =
    useState<DataFilterOption>("Energy Consumption");
  const [isAtBottom, setIsAtBottom] = useState<boolean>(false);

  const listRef = useRef<HTMLDivElement | null>(null);

  const handleFilterChange = (event: ChangeEvent<HTMLSelectElement>) =>
    setFilter(event.target.value as FilterOption);

  const handleDataFilterChange = (event: ChangeEvent<HTMLSelectElement>) =>
    setDataFilter(event.target.value as DataFilterOption);

  // Check if the user has scrolled to the bottom
  const handleScroll = () => {
    const element = listRef.current;
    if (element) {
      const isBottom =
        element.scrollHeight - element.scrollTop <= element.clientHeight;
      setIsAtBottom(isBottom);
    }
  };

  useEffect(() => {
    const element = listRef.current;
    if (element) {
      element.addEventListener("scroll", handleScroll);
      return () => element.removeEventListener("scroll", handleScroll);
    }
  }, []);

  return (
    <div className="p-4 h-screen flex flex-col space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <PageHeader title="Leaderboard for" className="text-lime-900" />
          <select
            value={filter}
            onChange={handleFilterChange}
            className="bg-white border border-lime-500 rounded-md p-2 text-lime-700"
          >
            <option value="Today">Today</option>
            <option value="Yesterday">Yesterday</option>
            <option value="Last 7 Days">Last 7 Days</option>
            <option value="Last Month">Last Month</option>
          </select>
        </div>
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-lime-700">Data:</span>
          <select
            value={dataFilter}
            onChange={handleDataFilterChange}
            className="bg-white border border-lime-500 rounded-md p-2 text-lime-700"
          >
            <option value="Carbon Emissions">Carbon Emissions</option>
            <option value="Energy Consumption">Energy Consumption</option>
          </select>
        </div>
      </div>

      {/* Top 3 Section */}
      <div className="grid grid-cols-3 gap-4 items-end">
        {[
          { title: "Top 2", size: "h-48", bgColor: "bg-lime-300" },
          { title: "Top 1", size: "h-64", bgColor: "bg-lime-400" },
          { title: "Top 3", size: "h-32", bgColor: "bg-lime-200" },
        ].map((item, index) => (
          <div key={index} className="flex flex-col items-center">
            <span className="font-semibold text-lime-900 mb-2">
              {item.title}
            </span>
            <div
              className={`${item.bgColor} ${item.size} w-full rounded-lg flex justify-center items-center`}
            >
              {item.title}
            </div>
          </div>
        ))}
      </div>

      {/* Other Companies Section */}
      <h3 className="text-lg font-semibold text-lime-700 mt-6">
        Other companies
      </h3>
      <div
        ref={listRef}
        className="p-4 rounded-lg flex-grow relative"
        style={{
          maxHeight: "600px",
          overflowY: "scroll",
          scrollbarWidth: "none",
        }}
      >
        <ul className="space-y-4">
          {leaderboardData.map((company, index) => (
            <li
              key={index}
              className="bg-white p-4 rounded-lg flex justify-between items-center border border-lime-400"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-lime-300 rounded-full"></div>
                <span className="font-medium text-lime-700">
                  {company.name}
                </span>
              </div>
              <span className="text-lime-900">Score: {company.score}%</span>
            </li>
          ))}
        </ul>

        {/* Fade Effect at Bottom */}
        {!isAtBottom && (
          <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-white to-transparent pointer-events-none" />
        )}

        {/* Scroll Down Indicator */}
        {!isAtBottom && (
          <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 text-lime-700 animate-bounce">
            ↓ Scroll down
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaderboardPage;
