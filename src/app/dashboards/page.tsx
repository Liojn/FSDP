/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"; // Treat this component as a Client Component

import React, { useState, useEffect } from "react";
import {
  fetchUniqueYears,
  getMetricsData,
  fetchMonthlyCarbonEmissions,
  fetchEmissionTarget,
  fetchEmissionCategory,
  EmissionData,
} from "../api/dashboards/api";
import { MetricCard } from "@/components/shared/metric-card"; // Cards component
import CarbonEmissionChart from "@/app/dashboards/charts/carbonEmissionChart";
import GaugeChartComponent from "@/app/dashboards/charts/gaugeGoal"; // Progress Gauge Chart
import EmissionCategoryChart from "@/app/dashboards/charts/emissionCategory";
import { PageHeader } from "@/components/shared/page-header";
import Modal from "./popup/modal";
import { Loader2, Flame, Leaf, Zap } from "lucide-react";
import ScopeModal from "./popup/scopeModal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ThresholdSettings from "./components/ThresholdSettings";
import RecommendationAlert from "./components/RecommendationAlert";
import { useRouter } from "next/navigation";

// Define interfaces
interface ScopeThreshold {
  id: string;
  scope: "Scope 1" | "Scope 2" | "Scope 3";
  description: string;
  value: number;
  unit: string;
}

interface TargetGoalResponse {
  target: number;
  isEarliestYear: boolean;
  firstYearGoal: number;
}
interface MetricData {
  title: string;
  value: string | number;
  unit: string;
}

interface EmissionCategoryData {
  category: string;
  value: number;
}

// Default descriptions for scopes
const defaultDescriptions = {
  "Scope 1": "Direct emissions from owned or controlled sources",
  "Scope 2":
    "Indirect emissions from purchased electricity, steam, heating, and cooling",
  "Scope 3": "All other indirect emissions in the value chain",
};

const DashboardPage = () => {
  const [loading, setLoading] = useState(true); // for loading page
  const [yearFilter, setYearFilter] = useState<string>(""); // Year filter selection
  const [yearOptions, setYearOptions] = useState<number[]>([]); // Store year options from API fetch
  const [selectedYear, setSelectedYear] = useState<number | null>(null); // Store selected year
  const [selectedMonth, setSelectedMonth] = useState<number | string>(""); // Track selected month

  // Modal state
  const [showModal, setShowModal] = useState(false); // Modal visibility
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [, setCategoryDetails] = useState<string | null>(null);

  // Company/User ID
  const [userId, setUserId] = useState<string | null>(null);

  // State for monthly emissions chart
  const [monthlyEmissions, setMonthlyEmissions] = useState<number[]>([]);
  const [averageAbsorbed, setAverageAbsorbed] = useState<number | null>(null);

  //Store the data for current and previous year emissions, GaugeChart
  const [currentYearEmissions, setCurrentYearEmissions] = useState<number | null>(0);
  const [previousYearEmissions, setPreviousYearEmissions] = useState<number | null>(0);
  const [targetGoal, setTargetGoal] = useState<number>(0); //default first, percentage reduction
  const [isEarliestYear, setIsEarliestYear] = useState<boolean>(false);
  const [firstYearGoal, setFirstYearGoal] = useState<number>(0); 
  // State for storing carbon emissions data for Emission Category Chart
  const [CategoryEmissionsData, setCategoryEmissionsData] = useState<
    EmissionCategoryData[] | null
  >(null);

  // State for metrics data (Cards)
  const [metricsData, setMetricsData] = useState<MetricData[]>([
    { title: "Total Energy Consumption", value: "Loading...", unit: "kWh" },
    { title: "Total Carbon Emissions", value: "Loading...", unit: "KG CO₂" },
    { title: "Total Net Emissions", value: "Loading...", unit: "KG CO₂" },
  ]);

  // Initialize thresholds state
  const [thresholds, setThresholds] = useState<ScopeThreshold[]>([]);
  const [exceedingScopes, setExceedingScopes] = useState<string[]>([]); // State to hold scopes exceeding thresholds

  const [isScopeModalOpen, setIsScopeModalOpen] = useState(false); // State for ScopeModal

  const router = useRouter();

  // Fetch user thresholds
  useEffect(() => {
    const fetchThresholds = async () => {
      const storedUserId = localStorage.getItem("userId");
      if (!storedUserId) {
        console.warn("No userId found");
        return;
      }

      try {
        const response = await fetch(`/api/thresholds?userId=${storedUserId}`);
        if (response.ok) {
          const data = await response.json();
          const userDefinedThresholds = data.thresholds.map(
            (threshold: ScopeThreshold) => ({
              ...threshold,
              description: defaultDescriptions[threshold.scope],
            })
          );
          setThresholds(userDefinedThresholds);
        } else {
          console.error("Failed to fetch user thresholds");
        }
      } catch (error) {
        console.error("Error fetching thresholds:", error);
      }
    };
    fetchThresholds();
  }, []);

  // Fetch the available list of years from the API
  useEffect(() => {
    const fetchYears = async () => {
      try {
        const companyId = localStorage.getItem("userId") || "";
        const storedUserId = localStorage.getItem("userId");
        if (storedUserId) {
          setUserId(storedUserId);
        }
        const years = await fetchUniqueYears(companyId);
        setYearOptions(years);

        // Set the default year to the latest year
        if (years.length > 0) {
          setYearFilter(years[0].toString());
          setSelectedYear(years[0]);
        }
      } catch (error) {
        setLoading(false);
        console.error("Failed to fetch years:", error);
      }
    };

    fetchYears();
  }, []);

  // Fetch emission and energy data based on the selected year and thresholds
  useEffect(() => {
    const fetchMetricsData = async () => {
      if (selectedYear && userId) {
        try {
          const companyId = localStorage.getItem("userId") || ''; //'671cf9a6e994afba6c2f332d';
          if (yearOptions.includes(selectedYear - 1)) { //range already defined in my options list, this is particularly for gauge
              // If the previous year is available, fetch data for both the current and previous year
              const [data, emissionsData, previousEmissionsData, targetGoal, emissionCategoryData] = await Promise.all([
                  getMetricsData(companyId, selectedYear),
                  fetchMonthlyCarbonEmissions(companyId, selectedYear),
                  getMetricsData(companyId, (selectedYear - 1)), // Fetch the emissions data for the previous year, use the net emission from the cards
                  fetchEmissionTarget(companyId, selectedYear) as Promise<TargetGoalResponse>,
                  fetchEmissionCategory(companyId, selectedYear, selectedMonth),
              ]);

              // Process data for both years
              if (data) {
                  const newMetricsData: MetricData[] = [
                    {
                      title: "Total Energy Consumption",
                      value: data["energyAverage in kWh"].toFixed(0),
                      unit: "kWh",
                    },
                    {
                      title: "Total Carbon Emissions",
                      value: data["carbonAverage in CO2E"].toFixed(0),
                      unit: "KG CO₂",
                    },
                    {
                      title: "Total Net Emissions",
                      value: data["netAverage in CO2E"].toFixed(0),
                      unit: "KG CO₂",
                    },
                  ];
                  setMetricsData(newMetricsData);
                  checkThresholds(newMetricsData);
                  setCurrentYearEmissions(data["carbonAverage in CO2E"]); //give the current year net admission
              }

              if (emissionsData) {
                  setMonthlyEmissions(emissionsData.monthlyEmissions); // Set the monthly emissions data for the current year
                  setAverageAbsorbed(emissionsData.averageAbsorb); // Set the average absorbed value for the current year
              }

              if (previousEmissionsData){
                setPreviousYearEmissions(previousEmissionsData["carbonAverage in CO2E"]); //give the prev year emission
              }

              if (targetGoal) {
                setTargetGoal(targetGoal.target);
                setIsEarliestYear(targetGoal.isEarliestYear);
                setFirstYearGoal(targetGoal.firstYearGoal);
              }
              // Set emission category data (this will be used for charts)
              if (emissionCategoryData) {
                setCategoryEmissionsData(emissionCategoryData); // This is the data you need for the chart
              }
          } else {
              //If the previous year is not available, fetch data only for the current year
              const [data, emissionsData, targetGoal, emissionCategoryData] = await Promise.all([
                  getMetricsData(companyId, selectedYear),
                  fetchMonthlyCarbonEmissions(companyId, selectedYear),
                  fetchEmissionTarget(companyId, selectedYear) as Promise<TargetGoalResponse>,
                  fetchEmissionCategory(companyId, selectedYear, selectedMonth)
              ]);

              if (data) {
                  const newMetricsData: MetricData[] = [
                    {
                      title: "Total Energy Consumption",
                      value: data["energyAverage in kWh"].toFixed(0),
                      unit: "kWh",
                    },
                    {
                      title: "Total Carbon Emissions",
                      value: data["carbonAverage in CO2E"].toFixed(0),
                      unit: "KG CO₂",
                    },
                    {
                      title: "Total Net Emissions",
                      value: data["netAverage in CO2E"].toFixed(0),
                      unit: "KG CO₂",
                    },
                  ];
                  setMetricsData(newMetricsData);
                  checkThresholds(newMetricsData);
                  setCurrentYearEmissions(data["carbonAverage in CO2E"]); //give the current year net admission
              }

              if (emissionsData) {
                  setMonthlyEmissions(emissionsData.monthlyEmissions); // Set the monthly emissions data
                  setAverageAbsorbed(emissionsData.averageAbsorb); // Set the average absorbed value
              }
              setPreviousYearEmissions(0); //no data for comparison

              if (targetGoal) {
                setTargetGoal(targetGoal.target);
                setIsEarliestYear(targetGoal.isEarliestYear);
                setFirstYearGoal(targetGoal.firstYearGoal);
              }
              // Set emission category data (this will be used for charts)
              if (emissionCategoryData) {
                setCategoryEmissionsData(emissionCategoryData); // This is the data you need for the chart
              }
          }
          setLoading(false);
        } catch (error) {
          console.error("Failed to fetch emission data:", error);
        }
      }
    };

    fetchMetricsData();
  }, [selectedYear, selectedMonth, thresholds]);

  // Handle year filter change
  const handleYearFilterChange = (value: string) => {
    const year = parseInt(value, 10);
    setYearFilter(value);
    setSelectedYear(year);
    setSelectedMonth("");
  };

  // Handler to toggle month selection
  const handleMonthClick = (month: string | number) => {
    if (selectedMonth === month) {
      setSelectedMonth("");
    } else {
      setSelectedMonth(month);
    }
  };

  // Check thresholds function
  const checkThresholds = (metrics: MetricData[]) => {
    const exceeding: string[] = [];

    // Map metrics to their corresponding scope types
    const metricToScope: { [key: string]: "Scope 1" | "Scope 2" | "Scope 3" } =
      {
        "Total Energy Consumption": "Scope 1",
        "Total Carbon Emissions": "Scope 2",
        "Total Net Emissions": "Scope 3",
      };

    metrics.forEach((metric) => {
      const scopeType = metricToScope[metric.title];
      const threshold = thresholds.find((t) => t.scope === scopeType);

      if (threshold && parseFloat(metric.value.toString()) > threshold.value) {
        exceeding.push(`${threshold.scope} (${threshold.description})`);
      }
    });

    setExceedingScopes(exceeding);
  };

  // Navigation handler for recommendations
  const handleViewRecommendations = (exceedingScopes: string[]) => {
    const scopes = exceedingScopes
      .map((scope) => {
        const match = scope.match(/(Scope [1-3])/);
        return match ? match[1] : null;
      })
      .filter((scope): scope is string => scope !== null);

    const query = scopes
      .map((scope) => `scopes=${encodeURIComponent(scope)}`)
      .join("&");
    router.push(`/recommendation?${query}`);
  };

  // Handle category click from the chart
  const handleCategoryClick = (category: string, details: string) => {
    setSelectedCategory(category);
    setCategoryDetails(details);
    setShowModal(true);
  };

  // Close modal handler
  const closeModal = () => {
    setShowModal(false);
    setSelectedCategory(null);
    setCategoryDetails(null);
  };

  // Mapping of titles to icons for the dashboard
  const getIconForMetric = (title: string) => {
    switch (title) {
      case "Total Carbon Emissions":
        return <Flame className="w-8 h-8 text-orange-500" strokeWidth={3} />;
      case "Total Energy Consumption":
        return <Zap className="w-8 h-8 text-yellow-500" strokeWidth={3} />;
      case "Total Net Emissions":
        return <Leaf className="w-8 h-8 text-green-500" strokeWidth={3} />;
      default:
        return null; // Or a default icon
    }
  };

  if (loading) {
    // Show spinner while loading
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-lime-600" />
      </div>
    );
  }

  return (
    <div className="pt-0 p-4 space-y-6">
      {/* Dashboard Header */}
      <div className="pt-0 flex justify-between items-center">
        <PageHeader title="Dashboard" />
        <div>
          {/* Dropdown menu and Threshold Settings */}
          <div className="flex items-center gap-2">
            <ThresholdSettings />
            <span className="font-semibold">Year: </span>
            <Select value={yearFilter} onValueChange={handleYearFilterChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Year" />
              </SelectTrigger>
              <SelectContent>
                {yearOptions.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      {/* Render RecommendationAlert only when there are exceeding scopes */}
      <RecommendationAlert
        exceedingScopes={exceedingScopes}
        onViewRecommendations={handleViewRecommendations}
      />
      {/* Dashboard Layout */}
      <div className="m-0 p-0 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Metrics and Charts */}
        <div className="md:col-span-2 space-y-6">
          {/* Dashboard Cards for Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {metricsData.map((metric, index) => (
              <div
                key={index}
                onClick={() => {
                  if (metric.title === "Total Carbon Emissions") {
                    setIsScopeModalOpen(true);
                  }
                }}
              >
                <MetricCard
                  title={metric.title}
                  value={
                    metric.value === "Loading..."
                      ? metric.value
                      : parseFloat(metric.value.toString()).toFixed(0)
                  }
                  unit={metric.unit}
                  icon={getIconForMetric(metric.title)} // Pass the icon dynamically
                  className={`bg-white p-4 shadow-md rounded-lg ${
                    metric.title === "Total Carbon Emissions"
                      ? "hover:cursor-pointer hover:bg-gray-50"
                      : ""
                  }`}
                />
                {/* ScopeModal */}
                <ScopeModal
                  isOpen={isScopeModalOpen}
                  onClose={() => setIsScopeModalOpen(false)}
                  year={selectedYear || new Date().getFullYear()}
                  month={selectedMonth ? Number(selectedMonth) : undefined}
                  userId={userId || ""}
                />
              </div>
            ))}
          </div>

          {/* Bar Chart */}
          <div className="bg-white p-4 shadow-md rounded-lg">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">
              Yearly Carbon Emission&apos;s Progress
            </h3>
            <div className="bg-white-200 h-full flex justify-center items-center min-h-[350px]">
              <CarbonEmissionChart
                monthlyEmissions={monthlyEmissions}
                averageAbsorbed={averageAbsorbed}
                onMonthClick={handleMonthClick}
              />
            </div>
          </div>
        </div>

        {/* Right Column: Gauge Chart and Emission Category Chart */}
        <div className="flex flex-col space-y-6">
          {/* Gauge Chart */}
          <div className="bg-white p-4 shadow-md rounded-lg h-60 flex flex-col">
            <h3 className="text-lg font-semibold text-gray-700 mb-4 flex-shrink-0">
              Net Emission Limit Indicator
            </h3>
            <div className="flex-1 flex flex-col">
              <div className="bg-white flex-1 flex justify-center items-center pb-4">
                {currentYearEmissions !== null &&
                targetGoal !== null &&
                previousYearEmissions !== null ? (
                  <GaugeChartComponent
                    currentYearEmissions={currentYearEmissions || 0}
                    previousYearEmissions={previousYearEmissions || 0}
                    targetReduction={targetGoal || 10000} //default, for now
                    initialYearGoal={firstYearGoal || 10000}
                    isEarliestYear={isEarliestYear || false}
                  />
                ) : (
                  <div>Loading gauge data...</div>
                )}
              </div>
            </div>
          </div>

          {/* Emission Category Chart */}
          <div className="bg-white p-4 shadow-md rounded-lg pb-0">
            <div className="flex justify-between items-center pb-0">
              <h3 className="text-lg font-semibold text-gray-700 flex-shrink-0">
                Emissions By Category
              </h3>
            </div>
            <div className="flex-1 flex justify-center items-center">
              <EmissionCategoryChart
                categoryData={CategoryEmissionsData}
                month={selectedMonth}
                onCategoryClick={handleCategoryClick}
              />
              {/* Modal Component */}
              {showModal && (
                <Modal
                  isVisible={showModal}
                  category={selectedCategory}
                  userId={userId || ""}
                  month={
                    selectedMonth !== undefined && selectedMonth !== null
                      ? Number(selectedMonth)
                      : undefined
                  }
                  year={selectedYear ?? new Date().getFullYear()}
                  onClose={closeModal}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;