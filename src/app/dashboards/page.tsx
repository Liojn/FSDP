"use client";

import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useData } from "@/context/DataContext"; // Use your context to get the data
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
import CarbonEmissionChart from "@/app/dashboards/charts/carbonEmissionChart";
import GaugeChartComponent from "@/app/dashboards/charts/gaugeGoal";
import EmissionCategoryChart from "@/app/dashboards/charts/emissionCategory";
import Modal from "@/app/dashboards/popup/modal";
import ScopeModal from "@/app/dashboards/popup/scopeModal";
import ThresholdSettings from "@/app/dashboards/components/ThresholdSettings";
import RecommendationAlert from "@/app/dashboards/components/RecommendationAlert";
import { useDashboardData } from "@/app/dashboards/hooks/useDashboardData";
import { generateSustainabilityReport } from "@/lib/generatePdf";
import { Button } from "@/components/ui/button";
import EmissionsChart from "../prediction/predictionComponents/predictionGraph";
import NetZeroGraph from "../prediction/netZeroGraph/netZeroGraph";
import html2canvas from "html2canvas";

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

  const [showModal, setShowModal] = useState(false);
  const [isScopeModalOpen, setIsScopeModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showChartsForExport, setShowChartsForExport] = useState(false);
  const { data, isLoading } = useData(); // Access data and isLoading from context
  const emissionsChartRef = useRef(null);
  const netZeroGraphRef = useRef(null);

  // References for PDF content

  const metricSectionRef = useRef<HTMLDivElement>(null);
  const carbonEmissionChartRef = useRef<HTMLDivElement>(null);
  const gaugeChartRef = useRef<HTMLDivElement>(null);
  const emissionCategoryChartRef = useRef<HTMLDivElement>(null);

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

  const handleGenerateReport = async () => {
    setShowChartsForExport(true);

    setTimeout(async () => {
      // Capture each chart separately once rendered
      const capturedElements = [
        metricSectionRef.current,
        carbonEmissionChartRef.current,
        gaugeChartRef.current,
        emissionCategoryChartRef.current,
        emissionsChartRef.current,
        netZeroGraphRef.current,
      ];

      const imageDataUrls = [];

      for (const element of capturedElements) {
        if (element) {
          try {
            const canvas = await html2canvas(element);
            const imageData = canvas.toDataURL("image/png");
            imageDataUrls.push(imageData);
          } catch (error) {
            console.error("Error capturing chart:", error);
          }
        }
      }

      // Pass the captured elements as expected by the function
      await generateSustainabilityReport(
        capturedElements,
        netZeroGraphRef,
        emissionsChartRef
      );

      setShowChartsForExport(false);
    }, 500); // Adjust delay if needed
  };

  if (loading || !userId || !selectedYear) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-lime-600" />
      </div>
    );
  }

  return (
    <div className="pt-0 p-4 space-y-6">
      <div className="pt-0 flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
        <PageHeader title="Dashboard" />

        <div className="flex flex-col md:flex-row md:items-center gap-5 space-y-4 md:space-y-0">
          <div className="flex flex-col md:flex-row md:items-center gap-5">
            <Button
              onClick={handleGenerateReport}
              className="bg-emerald-500 text-emerald-50 hover:bg-emerald-600 w-full md:w-auto"
            >
              Export Report to PDF
            </Button>

            <div className="flex justify-center md:justify-start w-full md:w-auto">
              <ThresholdSettings />
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <span className="font-semibold">Year:</span>
            <Select value={yearFilter} onValueChange={handleYearFilterChange}>
              <SelectTrigger className="w-full md:w-[180px]">
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
        <div className="md:col-span-2 space-y-6" ref={metricSectionRef}>
          {/* Main Metrics */}
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

          {/* Carbon Emission Chart */}
          <div
            className="bg-white p-4 shadow-md rounded-lg"
            ref={carbonEmissionChartRef}
          >
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

        {/* Gauge Chart */}
        <div className="flex flex-col space-y-6">
          <div
            className="bg-white p-4 shadow-md rounded-lg h-60 flex flex-col"
            ref={gaugeChartRef}
          >
            <h3 className="text-lg font-semibold text-gray-700 mb-4 flex-shrink-0">
              Net Emission Limit Indicator
            </h3>
            <div className="flex-1 flex flex-col">
              <div className="bg-white flex-1 flex justify-center items-center pb-4">
                {currentYearEmissions !== null &&
                targetGoal !== null &&
                previousYearEmissions !== null ? (
                  <GaugeChartComponent
                    currentYearEmissions={currentYearEmissions ?? 0}
                    previousYearEmissions={previousYearEmissions ?? 0}
                    targetReduction={targetGoal ?? 0}
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
          <div
            className="bg-white p-4 shadow-md rounded-lg pb-0"
            ref={emissionCategoryChartRef}
          >
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

      {showChartsForExport && (
        <div style={{ position: "absolute", top: -9999, left: -9999 }}>
          {/* Render hidden charts for PDF export */}
          <CarbonEmissionChart
            monthlyEmissions={monthlyEmissions}
            averageAbsorbed={averageAbsorbed}
            onMonthClick={handleMonthClick}
          />
          <GaugeChartComponent
            currentYearEmissions={currentYearEmissions ?? 0}
            previousYearEmissions={previousYearEmissions ?? 0}
            targetReduction={targetGoal}
            initialYearGoal={firstYearGoal || 10000}
            isEarliestYear={isEarliestYear || false}
          />
          <EmissionCategoryChart
            categoryData={categoryEmissionsData}
            month={selectedMonth}
            onCategoryClick={handleCategoryClick}
          />

          <EmissionsChart
            ref={emissionsChartRef}
            data={data || undefined}
            isLoading={isLoading}
          />
          <NetZeroGraph data={data || undefined} isLoading={isLoading} />
        </div>
      )}

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
