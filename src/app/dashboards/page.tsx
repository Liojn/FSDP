"use client";

import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Flame, Leaf, Zap } from "lucide-react";
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
import { useDashboardData } from "@/app/dashboards/hooks/useDashboardData";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { MetricData } from "@/types";
import useSWR from "swr";
import { useThresholdCheck } from "@/app/dashboards/hooks/useThresholdCheck";
import { ThresholdEmissionData } from "./types";

// Popover components
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

/**
 * A small overlay icon that displays threshold-exceeded info on hover/click.
 */
function AlertIconOverlay({
  exceedances,
  onViewRecommendations,
}: {
  exceedances: Array<{
    scope: string;
    exceededBy: number;
    unit: string;
  }>;
  onViewRecommendations: (scopes: string[]) => void;
}) {
  if (exceedances.length === 0) return null;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className="relative">
          {/* Increase the icon size */}
          <AlertCircle className="ml-3 w-8 h-8 text-red-500 cursor-pointer animate-pulse" />
        </div>
      </PopoverTrigger>

      <PopoverContent align="start" className="w-96">
        {" "}
        {/* Increase width */}
        <div className="p-4 space-y-3">
          {" "}
          {/* Add padding and spacing */}
          <p className="font-medium text-base">
            {" "}
            {/* Slightly larger font */}
            {exceedances.length === 1
              ? "1 emission scope has exceeded its threshold."
              : `${exceedances.length} emission scopes have exceeded their thresholds.`}
          </p>
          <ul className="list-disc list-inside text-base">
            {" "}
            {/* Increase font size */}
            {exceedances.map(({ scope, exceededBy, unit }) => (
              <li key={scope}>
                {scope}: Exceeded by{" "}
                <span className="font-semibold">
                  {exceededBy.toFixed(2)} {unit}
                </span>
              </li>
            ))}
          </ul>
          <Button
            onClick={() =>
              onViewRecommendations(exceedances.map((e) => e.scope))
            }
            className="bg-red-500 hover:bg-red-600 text-white w-full "
          >
            View Recommendations
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

const DashboardPage = () => {
  const router = useRouter();

  const {
    loading: initialLoading,
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
    handleYearFilterChange,
    handleMonthClick,
  } = useDashboardData();

  const getMonthAsNumber = (
    month: string | number | undefined
  ): number | undefined => {
    if (typeof month === "number") return month;
    if (typeof month === "string") {
      const parsed = parseInt(month, 10);
      return isNaN(parsed) ? undefined : parsed;
    }
    return undefined;
  };

  const {
    data: emissionsData,
    thresholds: thresholdData,
    exceedingScopes,
  } = useThresholdCheck(
    userId || "",
    selectedYear || new Date().getFullYear(),
    getMonthAsNumber(selectedMonth)
  );

  const { data: metricsDataToUse } = useSWR<MetricData>(
    userId ? `/api/metrics/${userId}` : null,
    fetcher
  );

  const [showModal, setShowModal] = useState(false);
  const [isScopeModalOpen, setIsScopeModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [exportProgress, setExportProgress] = useState(0);
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);
  const controllerRef = useRef<AbortController | null>(null);
  const [clickedMonthIndex, setClickedMonthIndex] = useState<number | null>(
    null
  );
  const { exceedances } = useThresholdCheck(
    userId || "",
    selectedYear || new Date().getFullYear(),
    getMonthAsNumber(selectedMonth)
  );

  // Only show loading screen on initial load
  if (initialLoading || !userId) {
    return (
      <div className="space-y-6 p-4">
        {/* Top Bar Skeleton */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
          {/* Page Title + (Possible) Alert Icon */}
          <div className="space-y-2">
            <Skeleton className="h-5 w-[150px]" />
            {/* Optionally, a smaller subline */}
            {/* <Skeleton className="h-4 w-[120px]" /> */}
          </div>
          {/* Right-side buttons (Export, Threshold, Year Filter) */}
          <div className="flex flex-col md:flex-row md:items-center gap-5">
            {/* Export Button & Threshold */}
            <div className="flex gap-3">
              <Skeleton className="h-10 w-[140px] rounded" />
              <Skeleton className="h-10 w-[140px] rounded" />
            </div>
            {/* Year Filter */}
            <div className="flex flex-col md:flex-row items-start gap-3">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-10 w-[130px] rounded" />
            </div>
          </div>
        </div>

        {/* Main Grid: Left (2/3) and Right (1/3) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left: Key Metrics + Yearly Chart */}
          <div className="md:col-span-2 space-y-6">
            {/* Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Skeleton className="h-[120px] rounded" />
              <Skeleton className="h-[120px] rounded" />
              <Skeleton className="h-[120px] rounded" />
            </div>

            {/* Yearly Carbon Emission's Progress Chart */}
            <div className="bg-white p-4 shadow-md rounded-lg h-[350px]">
              <Skeleton className="w-full h-full" />
            </div>
          </div>

          {/* Right: Gauge + Category Chart */}
          <div className="flex flex-col space-y-6">
            {/* Emission Reduction Progress Gauge */}
            <div className="bg-white p-4 shadow-md rounded-lg h-60">
              <Skeleton className="w-full h-full" />
            </div>

            {/* Emissions By Category Pie/Donut */}
            <div className="bg-white p-4 shadow-md rounded-lg h-[350px]">
              <Skeleton className="w-full h-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Handle the "View Recommendations" action
  const handleViewRecommendations = (exceedingScopes: string[]) => {
    const scopes = exceedingScopes
      .map((scope) => scope.match(/(Scope [1-3])/)?.[1])
      .filter((scope): scope is string => scope !== null);

    const query = scopes
      .map((scope) => `scopes=${encodeURIComponent(scope)}`)
      .join("&");
    router.push(`/recommendation?${query}`);
  };

  const handleMonthSelection = (monthIndex: number) => {
    setClickedMonthIndex(monthIndex === clickedMonthIndex ? null : monthIndex);
    handleMonthClick(monthIndex);
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
    if (!metricsDataToUse) {
      console.error("Metrics data is undefined.");
      return;
    }

    setIsCancelled(false);
    setExportProgress(10);

    const controller = new AbortController();
    controllerRef.current = controller;

    try {
      setTimeout(async () => {
        if (isCancelled) return;
        setExportProgress(30);

        const response = await fetch("/api/generate-report", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            metrics: metricsDataToUse,
          }),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Failed to generate report");
        }

        if (isCancelled) return;
        setExportProgress(80);

        const pdfBlob = await response.blob();
        const url = URL.createObjectURL(pdfBlob);

        const link = document.createElement("a");
        link.href = url;
        link.download = "sustainability_report.pdf";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setExportProgress(100);
        setTimeout(() => {
          setExportProgress(0);
          setIsAlertDialogOpen(false);
        }, 2000);
      }, 1000);
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") {
        console.error("Error generating report:", error);
        alert("Failed to generate report. Please try again.");
      }
      setExportProgress(0);
    }
  };

  return (
    <div className="pt-0 p-4 space-y-6">
      {/* Top Bar */}
      <div className="pt-0 flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
        {/* Page Title + Overlay Alert Icon */}
        <PageHeader
          title={
            <div className="flex items-center space-x-2">
              <span>Dashboard</span>
              {/* Show only if there are exceeding thresholds */}
              {exceedingScopes && exceedingScopes.length > 0 && (
                <AlertIconOverlay
                  exceedances={exceedances}
                  onViewRecommendations={handleViewRecommendations}
                />
              )}
            </div>
          }
        />

        {/* Right-side buttons (Export, Threshold, Year Filter) */}
        <div className="flex flex-col md:flex-row md:items-center gap-5 space-y-4 md:space-y-0">
          <div className="flex flex-col md:flex-row md:items-center gap-5">
            <AlertDialog
              open={isAlertDialogOpen}
              onOpenChange={setIsAlertDialogOpen}
            >
              <AlertDialogTrigger asChild>
                <Button
                  onClick={() => {
                    setIsAlertDialogOpen(true);
                    handleGenerateReport();
                  }}
                  className="w-full md:w-auto"
                >
                  Export Report to PDF
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Exporting Report</AlertDialogTitle>
                  <AlertDialogDescription>
                    Please wait while your sustainability report is being
                    generated.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <Progress value={exportProgress} className="mt-4" />
              </AlertDialogContent>
            </AlertDialog>

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

      {/* ======= Removed old RecommendationAlert block ======= */}

      <div className="m-0 p-0 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: Key Metrics + Yearly Chart */}
        <div className="md:col-span-2 space-y-6">
          {/* Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {metricsData.map((metric, index) => (
              <div
                key={index}
                onClick={() => {
                  // Example: open the Scope Modal if "Total Net Carbon Emissions" is clicked
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
                  className="bg-white p-4 shadow-md rounded-lg hover:cursor-pointer hover:bg-gray-50"
                />
              </div>
            ))}
          </div>

          {/* Yearly Carbon Emission's Progress */}
          <div className="bg-white p-4 shadow-md rounded-lg">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">
              Yearly Carbon Emission&apos;s Progress
            </h3>
            <div className="bg-white-200 h-full flex justify-center items-center min-h-[350px]">
              <CarbonEmissionChart
                monthlyEmissions={monthlyEmissions}
                averageAbsorbed={averageAbsorbed}
                onMonthClick={handleMonthSelection}
                clickedMonthIndex={clickedMonthIndex}
              />
            </div>
          </div>
        </div>

        {/* Right: Gauge + Category Chart */}
        <div className="flex flex-col space-y-6">
          {/* Emission Reduction Progress Gauge */}
          <div className="bg-white p-4 shadow-md rounded-lg h-60 flex flex-col">
            <h3 className="text-lg font-semibold text-gray-700 mb-4 flex-shrink-0">
              Emission Reduction Progress
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

          {/* Emissions By Category Pie/Donut */}
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

      {/* Category Details Modal */}
      {showModal && (
        <Modal
          isVisible={showModal}
          category={selectedCategory}
          userId={userId || ""}
          month={selectedMonth}
          year={selectedYear ?? new Date().getFullYear()}
          onClose={closeModal}
        />
      )}

      {/* Scope Details Modal */}
      <ScopeModal
        isOpen={isScopeModalOpen}
        onClose={() => setIsScopeModalOpen(false)}
        thresholds={(thresholdData || []).map((t) => ({
          ...t,
          description: `Threshold for ${t.scope}`,
        }))}
        data={emissionsData as ThresholdEmissionData | null}
        exceedingScopes={exceedingScopes}
        onViewRecommendations={handleViewRecommendations}
        year={selectedYear}
        month={selectedMonth}
      />
    </div>
  );
};

export default DashboardPage;
