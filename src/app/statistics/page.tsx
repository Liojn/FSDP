"use client"; //treat this component as a Client Component

import React from "react";

const metricsData = [
  { title: "2021's IMPACT", value: "100,000", unit: "MTCO2e" },
  { title: "2020's IMPACT", value: "300,000", unit: "MTCO2e" },
  // Replace this with actual data if needed
];

const categoryReductionData = [
  { category: "Cattle", reduction: 45 },
  { category: "Machinery", reduction: 30 },
  { category: "Crops", reduction: 50 },
  { category: "Waste", reduction: 20 },
];

// Function to calculate the progress bar width
const calculateProgress = (reduction: number) => reduction;

const categoryData = {
  all: { actual: "203,194", unit: "MTCO2e" },
  energy: { actual: "203,194", unit: "MTCO2e" },
  transportation: { actual: "85,853", unit: "MTCO2e" },
  waste: { actual: "25,472", unit: "MTCO2e" },
  cattle: { actual: "85,853", unit: "MTCO2e" },
};

const StatisticsPage = () => {
  return (
    <div className="h-full w-full p-2 rounded-lg">
      {/* Header Section */}
      <header className=" text-black">
        <h1 className="text-2xl font-Helvetica font-bold">
          Statistics Sustainability KPI
        </h1>
      </header>

      {/* Filter Bar */}
      <div className="flex justify-start items-center text-sm font-bold space-x-6 mt-1">
        {/* Year Dropdown */}
        <div>
          <span>Year: </span>
          <select className="">
            <option value="" disabled selected>
              Select Year
            </option>
            <option value="2021">2021</option>
            <option value="2022">2022</option>
            <option value="2023">2023</option>
            <option value="2024">2024</option>
          </select>
        </div>

        {/* Data Dropdown */}
        <div>
          <span>Data: </span>
          <select className="">
            <option value="" disabled selected>
              Select Data Type
            </option>
            <option value="carbon-emissions">Carbon Emissions</option>
            <option value="energy-consumption">Energy Consumption</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mt-2">
        {" "}
        {/* Change to 5 columns for custom widths */}
        {metricsData.map((metric, index) => (
          <div
            key={index}
            className="bg-white p-4 rounded-lg shadow-md flex flex-col items-center md:col-span-1 h-[95%]" // Adjusted for 1 column width
          >
            <h2 className="text-base font-bold text-gray-700">
              {metric.title}
            </h2>
            <p className="text-3xl font-semibold">{metric.value}</p>
            <span className="text-sm text-gray-500">{metric.unit}</span>
          </div>
        ))}
        {/* Third Box: Display Category Reductions with Progress Bar */}
        <div className="bg-white p-4 rounded-lg shadow-md md:col-span-3 h-[95%]">
          {" "}
          {/* Adjusted to take 3 columns */}
          <h2 className="text-base font-bold text-gray-700">
            Category Reductions
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {" "}
            {/* Use grid for 2 columns layout */}
            {categoryReductionData.map((data, index) => (
              <div key={index} className="flex flex-col">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold">{data.category}</span>
                  <span className="text-xs text-gray-600">reduced by</span>
                  <span className="text-sm text-gray-600">
                    {data.reduction}%
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-lg">
                  <div
                    className={`h-full ${
                      data.reduction >= 100 ? "bg-red-500" : "bg-blue-500"
                    } rounded-lg`}
                    style={{ width: `${calculateProgress(data.reduction)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {Object.entries(categoryData).map(([category, data]) => (
          <div
            key={category}
            className="bg-white p-1 rounded-lg shadow-md relative mt-3"
          >
            {/* Category Name Inside the Box */}
            <h3 className="text-sm font-semibold m-1">
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </h3>
            <div className="flex justify-between items-center ml-1">
              <div className="flex items-baseline space-x-2">
                <p className="text-xl font-bold">{data.actual}</p>
                <p className="text-xs">{data.unit}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap justify-between h-screen mt-2">
        {/* 1st Box - Emissions Over Time (Line Chart) */}
        <div className="flex flex-col w-[49.5%] h-[53%]">
          <h3 className="text-m font-semibold mb-2">Emissions Over Time</h3>
          <div className="bg-gray-100 h-full flex justify-center items-center rounded-lg">
            Line graph
          </div>
        </div>

        {/* 2nd Box - Scrollable Data List */}
        <div className="flex flex-col w-[49.5%] h-[53%]">
          <h3 className="text-m font-semibold">Data List</h3>
          <div className="bg-gray-100 h-full overflow-y-scroll p-4 rounded-lg mt-2">
            {/* Example scrollable content */}
            <ul className="space-y-2">
              {Array.from({ length: 50 }).map((_, index) => (
                <li key={index} className="p-4 bg-white shadow-md">
                  Data item {index + 1}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatisticsPage;
