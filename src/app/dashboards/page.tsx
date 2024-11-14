"use client";

import React, { useRef, useState } from "react";
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
import CarbonEmissionChart from "@/app/dashboards/charts/carbonEmissionChart";
import GaugeChartComponent from "@/app/dashboards/charts/gaugeGoal";
import EmissionCategoryChart from "@/app/dashboards/charts/emissionCategory";
import Modal from "@/app/dashboards/popup/modal";
import ScopeModal from "@/app/dashboards/popup/scopeModal";
import ThresholdSettings from "@/app/dashboards/components/ThresholdSettings";
import RecommendationAlert from "@/app/dashboards/components/RecommendationAlert";
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

const fetcher = (url: string) => fetch(url).then((res) => res.json());
// Function to map metrics array to MetricData object

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
  console.log("RIGHTHERE", userId);
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
  console.log("Metrics data received on client:", metricsDataToUse);

  const handleGenerateReport = async () => {
    if (!metricsDataToUse) {
      console.error("Metrics data is undefined.");
      return;
    }

    console.log("Metrics Data being sent:", metricsDataToUse);

    setIsCancelled(false);
    setExportProgress(10);

    const controller = new AbortController();
    controllerRef.current = controller;

    try {
      setTimeout(async () => {
        if (isCancelled) {
          return;
        }
        setExportProgress(30);

        const response = await fetch("/api/generate-report", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            metrics: metricsDataToUse, // Use metricsDataToUse directly
          }),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Failed to generate report");
        }

        if (isCancelled) {
          return;
        }
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
                  className="bg-emerald-500 text-emerald-50 hover:bg-emerald-600 w-full md:w-auto"
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
          month={selectedMonth !== null ? selectedMonth : undefined}
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
