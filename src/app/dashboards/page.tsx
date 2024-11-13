"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Flame, Leaf, Loader2, Zap } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { PageHeader } from "@/components/shared/page-header";
import { MetricCard } from "@/components/shared/metric-card";
import CarbonEmissionChart from "./charts/carbonEmissionChart";
import GaugeChartComponent from "./charts/gaugeGoal";
import EmissionCategoryChart from "./charts/emissionCategory";
import Modal from "./popup/modal";
import ScopeModal from "./popup/scopeModal";
import ThresholdSettings from "./components/ThresholdSettings";
import RecommendationAlert from "./components/RecommendationAlert";

import { useDashboardData } from "./hooks/useDashboardData";

const DashboardPage = () => {
  const router = useRouter();
  const {
    loading,
    yearFilter,
    yearOptions,
    selectedYear,
    selectedMonth,
    userId,
    monthlyEmissions,
    averageAbsorbed,
    currentYearEmissions,
    previousYearEmissions,
    targetGoal,
    isEarliestYear,
    firstYearGoal,
    categoryEmissionsData,
    metricsData,
    exceedingScopes,
    handleYearFilterChange,
    handleMonthClick,
  } = useDashboardData();

  // State for modals and interactions
  const [showModal, setShowModal] = React.useState(false);
  const [isScopeModalOpen, setIsScopeModalOpen] = React.useState(false);
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(
    null
  );

  // Handlers
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

  // Loading state
  if (loading || !userId || !selectedYear) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-lime-600" />
      </div>
    );
  }

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
                  value={
                    metric.value === "Loading..."
                      ? metric.value
                      : parseFloat(metric.value.toString()).toFixed(0)
                  }
                  unit={metric.unit}
                  icon={getIconForMetric(metric.title)}
                  className={`bg-white p-4 shadow-md rounded-lg ${
                    index === 1 ? "hover:cursor-pointer hover:bg-gray-50" : ""
                  }`}
                />
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
                {currentYearEmissions !== null &&
                targetGoal !== null &&
                previousYearEmissions !== null ? (
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
                categoryData={categoryEmissionsData}
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
          month={typeof selectedMonth === "number" ? selectedMonth : undefined}
          year={selectedYear ?? new Date().getFullYear()}
          onClose={closeModal}
        />
      )}

      <ScopeModal
        isOpen={isScopeModalOpen}
        onClose={() => setIsScopeModalOpen(false)}
        year={selectedYear || new Date().getFullYear()}
        month={typeof selectedMonth === "number" ? selectedMonth : undefined}
        userId={userId || ""}
      />
    </div>
  );
};

export default DashboardPage;
