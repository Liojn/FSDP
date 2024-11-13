"use client";

import React, { useState, useEffect } from 'react';
import { fetchUniqueYears, getMetricsData, fetchMonthlyCarbonEmissions, fetchEmissionTarget, fetchEmissionCategory } from '../api/dashboards/api';
import { MetricCard } from '@/components/shared/metric-card';
import CarbonEmissionChart from '@/app/dashboards/charts/carbonEmissionChart';
import GaugeChartComponent from "@/app/dashboards/charts/gaugeGoal";
import EmissionCategoryChart from '@/app/dashboards/charts/emissionCategory';
import { PageHeader } from '@/components/shared/page-header';
import Modal from './popup/modal';
import { Flame, Leaf, Loader2, Zap } from 'lucide-react';
import ScopeModal from './popup/scopeModal';
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

interface MetricData {
  title: string;
  value: string | number;
  unit: string;
}

interface EmissionCategoryData {
  category: string;
  value: number;
}

interface TargetGoalResponse {
  target: number;
  isEarliestYear: boolean;
  firstYearGoal: number;
}

// Default descriptions for scopes
const defaultDescriptions: Record<string, string> = {
  "Scope 1": "Direct emissions from owned or controlled sources",
  "Scope 2": "Indirect emissions from purchased electricity, steam, heating, and cooling",
  "Scope 3": "All other indirect emissions in the value chain",
};

// Define the relationship between metrics and scopes
const metricToScope: { [key: string]: "Scope 1" | "Scope 2" | "Scope 3" } = {
  "Total Energy Consumption": "Scope 1",
  "Total Net Carbon Emissions": "Scope 2",
  "Total Carbon Neutral Emissions": "Scope 3",
};
const DashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [yearFilter, setYearFilter] = useState<string>("");
  const [yearOptions, setYearOptions] = useState<number[]>([]);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number | string>("");
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [isScopeModalOpen, setIsScopeModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  // Company/User ID
  const [userId, setUserId] = useState<string | null>(null);
  // State for monthly emissions chart
  const [monthlyEmissions, setMonthlyEmissions] = useState<number[]>([]);
  const [averageAbsorbed, setAverageAbsorbed] = useState<number | null>(null);

  //Store the data for current and previous year emissions, GaugeChart
  const [currentYearEmissions, setCurrentYearEmissions] = useState<number | null>(0);
  const [previousYearEmissions, setPreviousYearEmissions] = useState<number | null>(0);
  const [targetGoal, setTargetGoal] = useState<number>(10000);
  const [isEarliestYear, setIsEarliestYear] = useState<boolean>(false);
  const [firstYearGoal, setFirstYearGoal] = useState<number>(0); 
  
  const [CategoryEmissionsData, setCategoryEmissionsData] = useState<EmissionCategoryData[] | null>(null);
  const [metricsData, setMetricsData] = useState<MetricData[]>([
    { title: "Total Energy Consumption", value: "Loading...", unit: "kWh" },
    { title: "Total Net Carbon Emissions", value: "Loading...", unit: "KG CO₂" },
    { title: "Total Carbon Neutral Emissions", value: "Loading...", unit: "KG CO₂" },
  ]);
  const [thresholds, setThresholds] = useState<ScopeThreshold[]>([]);
  const [exceedingScopes, setExceedingScopes] = useState<string[]>([]);

  const router = useRouter();

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

  useEffect(() => {
    const fetchYears = async () => {
      try {
        const storedUserId = localStorage.getItem("userId");
        if (storedUserId) {
          setUserId(storedUserId);
          const years = await fetchUniqueYears(storedUserId);
          setYearOptions(years);

          if (years.length > 0) {
            setYearFilter(years[0].toString());
            setSelectedYear(years[0]);
          }
        }
      } catch (error) {
        console.error("Failed to fetch years:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchYears();
  }, []);

  useEffect(() => {
    const fetchMetricsData = async () => {
      if (selectedYear && userId) {
        setLoading(true); // Set loading to true when starting to fetch
        try {
          const companyId = userId;
          if (yearOptions.includes(selectedYear - 1)) {
            const [data, emissionsData, previousEmissionsData, targetGoalData, emissionCategoryData] = await Promise.all([
              getMetricsData(companyId, selectedYear),
              fetchMonthlyCarbonEmissions(companyId, selectedYear),
              getMetricsData(companyId, selectedYear - 1),
              fetchEmissionTarget(companyId, selectedYear) as Promise<TargetGoalResponse>,
              fetchEmissionCategory(companyId, selectedYear, selectedMonth),
            ]);

            updateMetricsData(data, emissionsData, previousEmissionsData, targetGoalData, emissionCategoryData);
          } else {
            const [data, emissionsData, targetGoalData, emissionCategoryData] = await Promise.all([
              getMetricsData(companyId, selectedYear),
              fetchMonthlyCarbonEmissions(companyId, selectedYear),
              fetchEmissionTarget(companyId, selectedYear) as Promise<TargetGoalResponse>,
              fetchEmissionCategory(companyId, selectedYear, selectedMonth),
            ]);

            updateMetricsData(data, emissionsData, null, targetGoalData, emissionCategoryData);
          }
        } catch (error) {
          console.error("Failed to fetch emission data:", error);
        } finally {
          setLoading(false); // Set loading to false after fetching completes
        }
      }
    };

    fetchMetricsData();
  }, [selectedYear, selectedMonth, thresholds, userId, yearOptions]);

  // Update the checkThresholds function
  const checkThresholds = (metrics: MetricData[]) => {
    const exceeding: string[] = [];

    metrics.forEach((metric) => {
      const scopeType = metricToScope[metric.title];
      const threshold = thresholds.find((t) => t.scope === scopeType);

      if (threshold && parseFloat(metric.value.toString()) > threshold.value) {
        exceeding.push(`${threshold.scope} (${threshold.description})`);
      }
    });

    setExceedingScopes(exceeding);
  };
  // Update the updateMetricsData function to check thresholds
  const updateMetricsData = (
    data: any,
    emissionsData: any,
    previousEmissionsData: any,
    targetGoalData: any,
    emissionCategoryData: any
  ) => {
    if (data) {
      const newMetricsData: MetricData[] = [
        {
          title: "Total Energy Consumption",
          value: data["energyAverage in kWh"].toFixed(0),
          unit: "kWh",
        },
        {
          title: "Total Net Carbon Emissions",
          value: data["carbonAverage in CO2E"].toFixed(0),
          unit: "KG CO2",
        },
        {
          title: "Total Carbon Neutral Emissions",
          value: data["netAverage in CO2E"].toFixed(0),
          unit: "KG CO2",
        },
      ];

      setMetricsData(newMetricsData);
      checkThresholds(newMetricsData); // Check thresholds after updating metrics
      setCurrentYearEmissions(data["carbonAverage in CO2E"]);
    }

    if (emissionsData) {
      setMonthlyEmissions(emissionsData.monthlyEmissions);
      setAverageAbsorbed(emissionsData.averageAbsorb);
    }

    setPreviousYearEmissions(
      previousEmissionsData ? previousEmissionsData["carbonAverage in CO2E"] : 0
    );

    if (targetGoalData) {
      setTargetGoal(targetGoalData.target);
      setIsEarliestYear(targetGoalData.isEarliestYear);
      setFirstYearGoal(targetGoalData.firstYearGoal);
    }

    if (emissionCategoryData) {
      setCategoryEmissionsData(emissionCategoryData);
    }
  };
  // Update the loading condition to include data fetching states
  if (loading || !userId || !selectedYear) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-lime-600" />
      </div>
    );
  }

  const handleYearFilterChange = (value: string) => {
    const year = parseInt(value, 10);
    setYearFilter(value);
    setSelectedYear(year);
    setSelectedMonth("");
  };

  const handleMonthClick = (month: string | number) => {
    setSelectedMonth(selectedMonth === month ? "" : month);
  };

  const handleViewRecommendations = (exceedingScopes: string[]) => {
    const scopes = exceedingScopes
      .map((scope) => scope.match(/(Scope [1-3])/)?.[1])
      .filter((scope): scope is string => scope !== null);

    const query = scopes
      .map((scope) => `scopes=${encodeURIComponent(scope)}`)
      .join("&");
    router.push(`/recommendation?${query}`);
  };

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedCategory(null);
  };

  const getIconForMetric = (title: string) => {
    switch (title) {
      case "Total Net Carbon Emissions":
        return <Flame className="w-8 h-8 text-orange-500" strokeWidth={3} />;
      case "Total Energy Consumption":
        return <Zap className="w-8 h-8 text-yellow-500" strokeWidth={3} />;
      case "Total Carbon Neutral Emissions":
        return <Leaf className="w-8 h-8 text-green-500" strokeWidth={3} />;
      default:
        return null;
    }
  };

  
  return (
    <div className="pt-0 p-4 space-y-6">
      <div className="pt-0 flex justify-between items-center">
        <PageHeader title="Dashboard" />
        <div>
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

      <RecommendationAlert
        exceedingScopes={exceedingScopes}
        onViewRecommendations={handleViewRecommendations}
      />

 <div className="m-0 p-0 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {metricsData.map((metric, index) => (
              <div
                key={index}
                onClick={() => {
                  if (metric.title === "Total Net Carbon Emissions") {
                    setIsScopeModalOpen(true);
                  }
                }}
              >
                <MetricCard
                  title={metric.title}
                  value={metric.value === "Loading..." ? metric.value : parseFloat(metric.value.toString()).toFixed(0)}
                  unit={metric.unit}
                  icon={getIconForMetric(metric.title)}
                  className={`bg-white p-4 shadow-md rounded-lg ${index === 1 ? 'hover:cursor-pointer hover:bg-gray-50' : ''}`}                />
              </div>
            ))}
          </div>

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

        <div className="flex flex-col space-y-6">
          <div className="bg-white p-4 shadow-md rounded-lg h-60 flex flex-col">
            <h3 className="text-lg font-semibold text-gray-700 mb-4 flex-shrink-0">
              Net Emission Limit Indicator
            </h3>
            <div className="flex-1 flex flex-col">
              <div className="bg-white flex-1 flex justify-center items-center pb-4">
                {currentYearEmissions !== null && targetGoal !== null && previousYearEmissions !== null ? (
                  <GaugeChartComponent
                    currentYearEmissions={currentYearEmissions}
                    previousYearEmissions={previousYearEmissions}
                    targetReduction={targetGoal}
                    initialYearGoal={firstYearGoal || 10000}
                    isEarliestYear={isEarliestYear || false}
                  />
                ) : (
                  <div>Loading gauge data...</div>
                )}
              </div>
            </div>
          </div>

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
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <Modal
          isVisible={showModal}
          category={selectedCategory}
          userId={userId || ""}
          month={typeof selectedMonth === 'number' ? selectedMonth : undefined}
          year={selectedYear ?? new Date().getFullYear()}
          onClose={closeModal}
        />
      )}

      <ScopeModal
        isOpen={isScopeModalOpen}
        onClose={() => setIsScopeModalOpen(false)}
        year={selectedYear || new Date().getFullYear()}
        month={typeof selectedMonth === 'number' ? selectedMonth : undefined}
        userId={userId || ''}
      />
    </div>
  );
};

export default DashboardPage;