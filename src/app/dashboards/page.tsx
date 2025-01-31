"use client";

import React, { useRef, useState, useEffect } from "react";
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

import { useThresholdCheck } from "@/app/dashboards/hooks/useThresholdCheck";
import { ThresholdEmissionData } from "./types";
import NetZeroGraph from "../prediction/netZeroGraph/netZeroGraph";
import EmissionsChart from "../prediction/carbonNeutralGraph/predictionGraph";
import html2canvas from 'html2canvas';
import { useData, MonthlyData } from "@/context/DataContext";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

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

  // Create refs for invisible divs
  const netZeroGraphRef = useRef<HTMLDivElement>(null);
  const emissionsChartRef = useRef<HTMLDivElement>(null);
  const { setData, setIsLoading } = useData();

  const fetchHistoricalData = async () => {
        const userName = localStorage.getItem("userName");
        try {
          const endYear = new Date().getFullYear();
          const startYear = endYear - 4;
  
          const promises = Array.from({ length: 5 }, (_, i) => {
            return fetch("/api/prediction", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                userName: userName || "",
              },
              body: JSON.stringify({
                endYear: startYear + i,
                dataType: "carbon-emissions",
              }),
            }).then((res) => res.json());
          });
  
          const results = await Promise.all(promises);
  
          const combinedData: MonthlyData = {
            equipment: [],
            livestock: [],
            crops: [],
            waste: [],
            totalMonthlyEmissions: [],
            totalMonthlyAbsorption: [],
            netMonthlyEmissions: [],
            emissionTargets: {},
          };
  
          results.forEach((result) => {
            Object.keys(result.monthlyData).forEach((key) => {
              if (key === "emissionTargets") {
                combinedData.emissionTargets = {
                  ...combinedData.emissionTargets,
                  ...result.monthlyData.emissionTargets,
                };
              } else {
                combinedData[key as keyof MonthlyData] = [
                  ...(combinedData[key as keyof MonthlyData] as number[]),
                  ...result.monthlyData[key as keyof MonthlyData],
                ];
              }
            });
          });
  
          setData(combinedData); // Use setData from context
        } catch (err) {
          setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
          setIsLoading(false); // Use setIsLoading from context
        }
  };
  
  // Run `fetchHistoricalData` once on component load
  useEffect(() => {
    fetchHistoricalData();
  }, []); // Empty dependency array ensures it runs only once

  // Only show loading screen on initial load
  if (initialLoading || !userId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-lime-600" />
      </div>
    );
  }

  const handleViewRecommendations = (exceedingScopes: string[]) => {
    const scopes = exceedingScopes
      .map((scope) => scope.match(/(Scope [1-3])/)?.[1])
      .filter((scope): scope is string => scope !== null);

    const query = scopes
      .map((scope) => `scopes=${encodeURIComponent(scope)}`)
      .join("&");
    router.push(`/recommendation?${query}`);
  };

  if (initialLoading || !userId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-lime-600" />
      </div>
    );
  }

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

    const invisibleDiv = document.getElementById('invisible-div');
    if (invisibleDiv) {
        invisibleDiv.style.display = 'block'; // Show the div
    }

    setIsCancelled(false);
    setExportProgress(10);

    const controller = new AbortController();
    controllerRef.current = controller;

    try {
      setTimeout(async () => {

        let netZeroImage = null;
        let emissionsChartImage = null;

      if (netZeroGraphRef.current) {
        try {
          console.log("Capturing Net Zero Graph...");
          const canvas = await html2canvas(netZeroGraphRef.current);
          netZeroImage = canvas.toDataURL("image/png");
          console.log("Net Zero Graph captured successfully.");
        } catch (error) {
          console.error("Error capturing Net Zero Graph:", error);
        }
      }
      if (emissionsChartRef.current) {
        try {
          console.log("Capturing Net Zero Graph...");
          const canvas = await html2canvas(emissionsChartRef.current);
          emissionsChartImage = canvas.toDataURL("image/png");
          console.log("Net Zero Graph captured successfully.");
        } catch (error) {
          console.error("Error capturing Net Zero Graph:", error);
        }
      }

        if (isCancelled) return;
        setExportProgress(30);

        const response = await fetch("/api/generate-report", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            metrics: metricsDataToUse,
            netZeroImage,
            emissionsChartImage,
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

        // Step 5: Once the report is generated, hide the invisible div
        if (invisibleDiv) {
            invisibleDiv.style.display = 'none'; // Hide the div after completion
        }

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
      {/* Add RecommendationAlert if there are exceeding scopes */}
      {exceedingScopes && exceedingScopes.length > 0 && (
        <div className="mb-4">
          <RecommendationAlert
            exceedingScopes={exceedingScopes}
            onViewRecommendations={handleViewRecommendations}
          />
        </div>
      )}
      <div className="m-0 p-0 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {metricsData.map((metric, index) => (
              <div
                key={index}
                onClick={() => {
                  console.log("Clicked metric:", metric.title);
                  if (metric.title === "Total Net Carbon Emissions") {
                    console.log("Opening ScopeModal...");
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
                onMonthClick={handleMonthSelection}
                clickedMonthIndex={clickedMonthIndex}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col space-y-6">
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

      {/* Invisible div section */}
      <div
        id="invisible-div"
        className="container mx-auto p-4 space-y-6"
        style={{ display: "none" }}
      >
        <div className="" ref={netZeroGraphRef}>
          <NetZeroGraph />
        </div>
        <div className="" ref={emissionsChartRef}>
          <EmissionsChart />
        </div>
      </div>

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

      <ScopeModal
        isOpen={isScopeModalOpen}
        onClose={() => setIsScopeModalOpen(false)}
        thresholds={thresholdData || []}
        data={emissionsData as ThresholdEmissionData | null}
        exceedingScopes={exceedingScopes}
        onViewRecommendations={handleViewRecommendations}
        year={selectedYear}
        month={selectedMonth}
      />


    </div>
  );
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function setError(arg0: string) {
  throw new Error("Function not implemented.");
}

export default DashboardPage;
