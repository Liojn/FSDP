"use client"; //treat this component as a Client Component

import React, { useState, useEffect } from "react";
import { MetricCard } from "../../components/shared/metric-card";
import LineGraphContainer from "./lineCharts/allLineChart";
import CropEmissionGraphContainer from "./lineCharts/cropsLineChart";
import LivestockEmissionsGraphContainer from "./lineCharts/livestockLineChart";
import EquipmentLineChart from "./lineCharts/equipmentLineChart";
import { FunnelIcon } from "@heroicons/react/24/solid";
import WasteEmissionGraphContainer from "./lineCharts/wasteLineChart";
import { PageHeader } from "@/components/shared/page-header";

interface Metric {
  title: string;
  value: number; // value can be string for easier display formatting
  unit: string;
}

interface Category {
  actual: string;
  unit: string;
}

interface CategoryData {
  [key: string]: Category;
}

interface ReductionCategory {
  reduction: string;
}

interface CategoryReductionData {
  [key: string]: ReductionCategory;
}

const StatisticsPage = () => {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [dataType, setDataType] = useState("carbon-emissions");
  const [metricsData, setMetricsData] = useState<Metric[]>([]);
  const [categoryReductionData, setCategoryReductionData] =
    useState<CategoryReductionData>({});
  const [categoryData, setCategoryData] = useState<CategoryData>({});
  const [category, setCategory] = useState("all");

  // Store selected year and datatype
  useEffect(() => {
    localStorage.setItem("selectedYear", year.toString());
    localStorage.setItem("selectedDataType", dataType);
  }, [year, dataType]);

  // Filter to fetch data based on selected year and data type
  const fetchData = async (selectedYear: number, dataType: string) => {
    const userName = localStorage.getItem("userName") || "userName";

    // Get impact data for current year
    try {
      const responseCurrent = await fetch("/api/statistics/yearlyImpact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          userName: userName,
        },
        body: JSON.stringify({
          endYear: selectedYear,
          dataType: dataType,
        }),
      });
      const dataCurrent = await responseCurrent.json();

      // Get impact data for previous year
      const responsePrevious = await fetch("/api/statistics/yearlyImpact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          userName: userName,
        },
        body: JSON.stringify({
          endYear: selectedYear - 1,
          dataType: dataType,
        }),
      });
      const dataPrevious = await responsePrevious.json();
      const unit = dataType === "carbon-emissions" ? "CO2e" : "kWh";

      // Ensure dataCurrent and dataPrevious have the required properties
      if (
        !dataCurrent ||
        !dataPrevious ||
        typeof dataCurrent.total === "undefined" ||
        typeof dataPrevious.total === "undefined"
      ) {
        console.error(
          "Data structure mismatch. Missing 'total' or 'calculations' in API response."
        );
        return;
      }
      // Store impact data for current and previous year
      const transformedMetricsData: Metric[] = [
        {
          title: `${selectedYear}'s IMPACT`,
          value: dataCurrent.total.toFixed(2),
          unit: unit,
        },
        {
          title: `${selectedYear - 1}'s IMPACT`,
          value: dataPrevious.total.toFixed(2),
          unit: unit,
        },
      ];
      setMetricsData(transformedMetricsData);

      // Calculate percentage reduction or increase for each category
      const calculateReduction = (
        current: number,
        previous: number
      ): string => {
        if (previous === 0) return "N/A"; // Handle division by zero
        const reduction = ((current - previous) / previous) * 100;
        return reduction >= 0
          ? `increase by ${Math.abs(reduction).toFixed(2)}%`
          : `reduced by ${Math.abs(reduction).toFixed(2)}%`;
      };

      const categoryReductionData: CategoryReductionData = {
        all: {
          reduction: calculateReduction(dataCurrent.total, dataPrevious.total),
        },
        equipment: {
          reduction:
            dataCurrent.yearlyData.equipment &&
            dataPrevious.yearlyData.equipment
              ? calculateReduction(
                  dataCurrent.yearlyData.equipment,
                  dataPrevious.yearlyData.equipment
                )
              : "N/A",
        },
        livestock: {
          reduction:
            dataCurrent.yearlyData.livestock &&
            dataPrevious.yearlyData.livestock
              ? calculateReduction(
                  dataCurrent.yearlyData.livestock,
                  dataPrevious.yearlyData.livestock
                )
              : "N/A",
        },
        crops: {
          reduction:
            dataCurrent.yearlyData.crops && dataPrevious.yearlyData.crops
              ? calculateReduction(
                  dataCurrent.yearlyData.crops,
                  dataPrevious.yearlyData.crops
                )
              : "N/A",
        },
        waste: {
          reduction:
            dataCurrent.yearlyData.waste && dataPrevious.yearlyData.waste
              ? calculateReduction(
                  dataCurrent.yearlyData.waste,
                  dataPrevious.yearlyData.waste
                )
              : "N/A",
        },
      };
      setCategoryReductionData(categoryReductionData);

      // Total emissions per category per year
      const transformedCategoryData: CategoryData = {
        all: { actual: dataCurrent.total.toFixed(2), unit: unit },
        equipment: {
          actual: dataCurrent.yearlyData.equipment?.toFixed(2) || "0",
          unit: unit,
        },
        livestock: {
          actual: dataCurrent.yearlyData.livestock?.toFixed(2) || "0",
          unit: unit,
        },
        crops: {
          actual: dataCurrent.yearlyData.crops?.toFixed(2) || "0",
          unit: unit,
        },
        waste: {
          actual: dataCurrent.yearlyData.waste?.toFixed(2) || "0",
          unit: unit,
        },
      };
      setCategoryData(transformedCategoryData);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    }
  };

  // Fetch data when year or dataType changes with filters applied
  useEffect(() => {
    if (year && dataType) {
      fetchData(year, dataType);
    }
  }, [year, dataType]);

  return (
    <div className="h-full w-full pl-3 pr-3 -mt-4 rounded-lg">
      {/* Header Section */}
      <PageHeader title="Statistics Sustainabilty KPI"/>

      <div className="flex justify-start items-center text-sm font-bold space-x-6 mt-1 p-2 rounded">
        {/* Filter Icon */}
        <FunnelIcon className="h-5 w-5 text-gray-800 -ml-1" />

        {/* Year Dropdown */}
        <div>
          <span>Year: </span>
          <select
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
            className=""
          >
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
          <span>Data Type: </span>
          <select
            value={dataType}
            onChange={(e) => setDataType(e.target.value)}
            className=""
          >
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
        {/* Current Year Impact */}
        <div className="">
          <MetricCard
            title={`${year}'s IMPACT`}
            value={metricsData[0]?.value || 0}
            unit={metricsData[0]?.unit || ""}
            className="pt-3"
          />
        </div>
        {/* Previous Year Impact */}
        <div className="">
          <MetricCard
            title={`${year - 1}'s IMPACT`}
            value={metricsData[1]?.value || 0}
            unit={metricsData[1]?.unit || ""}
            className="pt-3"
          />
        </div>
        {/* Third Box: Display Category Reductions with Progress Bar */}
        <div className="bg-white p-2 pl-4 rounded-lg shadow-xl md:col-span-3 h-[100%]">
          <h2 className="text-base font-bold text-gray-700">
            Category Differences (compared to previous year)
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(categoryReductionData).map(
              ([category, data], index) => {
                const isIncrease = data.reduction.includes("increase");
                const percentage = data.reduction.replace(/[^0-9.]/g, "");

                return (
                  <div key={index} className="flex flex-col">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold text-gray-600">
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </span>
                      <div className="flex items-center">
                        <span className="text-sm text-gray-600">
                          {percentage}%
                        </span>
                        <span className="text-sm text-gray-600 ml-1">
                          {isIncrease ? "↑" : "↓"}
                        </span>
                      </div>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-lg">
                      <div
                        className={`h-full ${
                          isIncrease ? "bg-red-400" : "bg-lime-400"
                        } rounded-lg`}
                        style={{
                          width: `${Math.min(Number(percentage), 100)}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </div>
      </div>

      {/* Static Categories Display */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mt-2">
        {[
          { key: "all", label: "All" },
          { key: "crops", label: "Crops" },
          { key: "livestock", label: "Livestock" },
          { key: "equipment", label: "Equipment" },
          { key: "waste", label: "Waste" },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setCategory(key)} // Update category when button is clicked
            className={`p-2 rounded-lg shadow-md relative mt-3 text-left ${
              category === key ? "bg-lime-400" : "bg-white hover:bg-lime-200"
            }`}
          >
            <h3 className="text-sm font-semibold m-1">{label}</h3>
            <div className="flex justify-between items-center ml-1">
              <div className="flex items-baseline space-x-2">
                <p className="text-xl font-bold">
                  {categoryData[key]?.actual || "-"}
                </p>
                <p className="text-xs">{categoryData[key]?.unit || ""}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="flex flex-wrap justify-between h-screen mt-2">
        {/* 1st Box - Emissions Over Time (Line Chart) */}
        <div className="flex flex-col w-[49.5%] h-[42%] mt-5">
          <div className="bg-white h-full flex justify-center items-center rounded-lg">
            {category === "all" ? (
              <LineGraphContainer
                selectedYear={year}
                dataType={dataType}
                category={category}
              />
            ) : category === "crops" ? (
              <CropEmissionGraphContainer
                selectedYear={year}
                dataType={dataType}
                category={category}
              />
            ) : category === "livestock" ? (
              <LivestockEmissionsGraphContainer
                selectedYear={year}
                dataType={dataType}
                category={category}
              />
            ) : category === "equipment" ? (
              <EquipmentLineChart
                selectedYear={year}
                dataType={dataType}
                category={category}
              />
            ) : category === "waste" ? (
              <WasteEmissionGraphContainer
                selectedYear={year}
                dataType={dataType}
                category={category}
              />
            ) : (
              <p>Please select &quot;All&quot; to view the line chart.</p>
            )}
          </div>
        </div>

        {/* 2nd Box - Scrollable Data List */}
        <div className="flex flex-col w-[49.5%] h-[48%]">
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
