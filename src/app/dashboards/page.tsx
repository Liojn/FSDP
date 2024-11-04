"use client"; //treat this component as a Client Component

import React, { useState, useEffect } from 'react';
import { fetchUniqueYears, getMetricsData, EmissionData } from '../api/dashboards/api';
import { MetricCard } from '@/components/shared/metric-card'; //Cards component

const LineChart = () => <div className="bg-gray-200 h-full flex justify-center items-center">Line graph</div>;

/*Fake data for metrics and leaderboard
const metricsData = [
    { title: "Average Monthly Energy", value: "Loading...", unit: "kWh" },
    { title: "Average Carbon Emissions", value: "Loading...", unit: "KG CO2" },
    { title: "Average Net Emission", value: "Loading...", unit: "KG CO2" }
];*/
  
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
  <div className="bg-white p-4 shadow-md rounded-lg h-60 flex flex-col"> 
    <h3 className="text-lg font-semibold text-gray-700 mb-4 flex-shrink-0">Overall Pie Chart Graph</h3>
    <div className="flex-1 flex flex-col">
      <div className="bg-gray-300 flex-1 flex justify-center items-center pb-4">Your Graph Here</div>
    </div>
  </div>
);
  
const DashboardPage = () => {

  const [yearFilter, setYearFilter] = useState<string>(''); //Year filter selection, holds the currently selected year from the dropdown. Initially set to an empty string
  const [yearOptions, setYearOptions] = useState<number[]>([]); //store Year options from API fetch, initialized as an empty array,
  const [selectedYear, setSelectedYear] = useState<number | null>(null); //Store selected year for subsequent API calls

  const [metricsData, setMetricsData] = useState([ //var to store the data and display, initially predefined
  { title: "Average Energy Consumption", value: "Loading...", unit: "kWh" },
  { title: "Average Carbon Emissions", value: "Loading...", unit: "KG CO2" },
  { title: "Average Net Emission", value: "Loading...", unit: "KG CO2" }
  ]);

  //Fetch the avail list of years from the API
  useEffect(() => {
    const fetchYears = async () => {
      try {
        const companyId = '671cf9a6e994afba6c2f332d'; //Assigned now for simplicity
        const years = await fetchUniqueYears(companyId);
        setYearOptions(years); //Update the year options state, call the function

        //Set the default year to the latest year
        if (years.length > 0) {
          setYearFilter(years[0].toString()); //Set to the latest year as default
          setSelectedYear(years[0]); // Store the selected year
        }
      } catch (error) {
        console.error('Failed to fetch years:', error);
      }
    };

    fetchYears();
  }, []); //Empty dependency array, runs once after render

  //Fetch emission and energy data based on the selected year
  useEffect(() => {
    const fetchMetricsData = async () => {
      if (selectedYear) {
        try {
          const companyId = '671cf9a6e994afba6c2f332d';
          const data = await getMetricsData(companyId, selectedYear);
          if (data) {
            setMetricsData([
              { title: "Average Energy Consumption", value: data["energyAverage in kWh"].toFixed(2), unit: "kWh" },
              { title: "Average Carbon Emissions", value: data["carbonAverage in CO2E"].toFixed(2), unit: "KG CO2" },
              { title: "Average Net Emission", value: data["netAverage in CO2E"].toFixed(2), unit: "KG CO2" }
            ]);
          }
        } catch (error) {
          console.error("Failed to fetch emission data:", error);
        }
      }
    };

    fetchMetricsData();
  }, [selectedYear]);

  //Handle year filter change
  const handleYearFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const year = parseInt(event.target.value, 10);
    setYearFilter(event.target.value); //retrieves the selected year, which is then stored in yearFilter
    setSelectedYear(year);

  };

  
  return (
    <div className="pt-0 p-4 space-y-6">
      {/* Dashboard Header */}
      <div className="pt-0 flex justify-between items-center mb-4">
        <div className="text-2xl font-bold">Dashboard</div>
        <div> {/*Dropdown menu */}
        <span className="font-semibold">Year: </span>
        <select
          value={yearFilter}
          onChange={handleYearFilterChange} 
          className="bg-white border border-gray-300 rounded-md p-2 text-gray-700"
        >
          <option value="">Select Year</option>
          {yearOptions.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
        </div>
      </div>

      {/* Dashboard Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Metrics and Charts */}
        <div className="md:col-span-2 space-y-6">
          {/* Dashboard Cards for Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {metricsData.map((metric, index) => (
              <MetricCard
                key={index}
                title={metric.title}
                value={metric.value === "Loading..." ? metric.value : parseFloat(metric.value)} // condition ? valueIfTrue : valueIfFalse
                unit={metric.unit}
                className="bg-white p-4 shadow-md rounded-lg"
              />
            ))}
          </div>

          {/* Line Chart: */}
          <div className="bg-white p-4 shadow-md rounded-lg">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">
              Carbon Emission Trend/Energy Consumption Trend
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