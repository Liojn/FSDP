import React, { Suspense, lazy } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { PageHeader } from "../../components/shared/page-header";
import { MetricCard } from "../../components/shared/metric-card";
import { Button } from "../../components/ui/button";
import { Progress } from "../../components/ui/progress";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../../components/ui/alert-dialog";
import { MetricData } from "./types";
import { useDashboardData } from "./hooks/useDashboardData";
import useSWR, { preload } from "swr";

// Optimized fetcher with caching
const fetcher = async (url: string) => {
  // Check cache first
  const cached = sessionStorage.getItem(url);
  if (cached) {
    const { data, timestamp } = JSON.parse(cached);
    // Cache for 5 minutes
    if (Date.now() - timestamp < 5 * 60 * 1000) {
      return data;
    }
  }

  const res = await fetch(url);
  const data = await res.json();

  // Store in cache
  sessionStorage.setItem(
    url,
    JSON.stringify({
      data,
      timestamp: Date.now(),
    })
  );

  return data;
};

// Preload data for faster initial load
if (typeof window !== "undefined") {
  const userId = localStorage.getItem("userId");
  if (userId) {
    preload(`/api/metrics/${userId}`, fetcher);
  }
}

// Dynamically import heavy components with preload hints
const CarbonEmissionChart = lazy(() => {
  const Component = import("./charts/carbonEmissionChart");
  // Add preload hint
  Component.then(() => {
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "script";
    link.href = "/charts/carbonEmissionChart.js";
    document.head.appendChild(link);
  });
  return Component;
});

// Dynamically import other components
const GaugeChartComponent = lazy(() => import("./charts/gaugeGoal"));
const EmissionCategoryChart = lazy(() => import("./charts/emissionCategory"));
const Modal = lazy(() => import("./popup/modal"));
const ScopeModal = lazy(() => import("./popup/scopeModal"));
const ThresholdSettings = lazy(() => import("./components/ThresholdSettings"));
const RecommendationAlert = lazy(
  () => import("./components/RecommendationAlert")
);

// Dynamically import icons with loading state
const Icons = {
  Flame: dynamic(() => import("lucide-react").then((mod) => mod.Flame), {
    loading: () => (
      <div className="w-8 h-8 bg-gray-200 animate-pulse rounded" />
    ),
    ssr: false,
  }),
  Zap: dynamic(() => import("lucide-react").then((mod) => mod.Zap), {
    loading: () => (
      <div className="w-8 h-8 bg-gray-200 animate-pulse rounded" />
    ),
    ssr: false,
  }),
  Leaf: dynamic(() => import("lucide-react").then((mod) => mod.Leaf), {
    loading: () => (
      <div className="w-8 h-8 bg-gray-200 animate-pulse rounded" />
    ),
    ssr: false,
  }),
};

const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <Loader2 className="h-8 w-8 animate-spin text-lime-600" />
  </div>
);

interface MetricCardWrapperProps {
  metric: MetricData;
  icon: React.ReactNode;
}

const MetricCardWrapper = React.memo<MetricCardWrapperProps>(
  ({ metric, icon }) => (
    <MetricCard
      title={metric.title}
      value={
        metric.value === "Loading..."
          ? metric.value
          : parseFloat(metric.value.toString()).toFixed(0)
      }
      unit={metric.unit}
      icon={icon}
      className={`bg-white p-4 shadow-md rounded-lg ${
        metric.title === "Total Net Carbon Emissions"
          ? "hover:cursor-pointer hover:bg-gray-50"
          : ""
      }`}
    />
  )
);

// Add display name to the component
MetricCardWrapper.displayName = "MetricCardWrapper";

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
    exceedingScopes,
    handleYearFilterChange,
    handleMonthClick,
  } = useDashboardData();

  const { data: metricsDataToUse } = useSWR<MetricData>(
    userId ? `/api/metrics/${userId}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60000, // Cache for 1 minute
      suspense: true, // Enable suspense mode
      keepPreviousData: true, // Keep showing previous data while loading
    }
  );

  const [showModal, setShowModal] = React.useState(false);
  const [isScopeModalOpen, setIsScopeModalOpen] = React.useState(false);
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(
    null
  );
  const [exportProgress, setExportProgress] = React.useState(0);
  const [isAlertDialogOpen, setIsAlertDialogOpen] = React.useState(false);
  const [isCancelled, setIsCancelled] = React.useState(false);
  const controllerRef = React.useRef<AbortController | null>(null);
  const [clickedMonthIndex, setClickedMonthIndex] = React.useState<
    number | null
  >(null);

  // Early return for loading state
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

  const handleMonthSelection = (monthIndex: string | number) => {
    const monthIndexNumber =
      typeof monthIndex === "string" ? parseInt(monthIndex, 10) : monthIndex;
    setClickedMonthIndex(monthIndexNumber);
    handleMonthClick(monthIndexNumber);
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
        return (
          <Icons.Flame className="w-8 h-8 text-orange-500" strokeWidth={3} />
        );
      case "Total Energy Consumption":
        return (
          <Icons.Zap className="w-8 h-8 text-yellow-500" strokeWidth={3} />
        );
      case "Total Carbon Neutral Emissions":
        return (
          <Icons.Leaf className="w-8 h-8 text-green-500" strokeWidth={3} />
        );
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
        URL.revokeObjectURL(url); // Clean up the URL object

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
              <Suspense fallback={<LoadingSpinner />}>
                <ThresholdSettings />
              </Suspense>
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

      <Suspense fallback={<LoadingSpinner />}>
        <RecommendationAlert
          exceedingScopes={exceedingScopes}
          onViewRecommendations={handleViewRecommendations}
        />
      </Suspense>

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
                <Suspense
                  fallback={
                    <div className="h-32 bg-gray-100 animate-pulse rounded-lg" />
                  }
                >
                  <MetricCardWrapper
                    metric={metric}
                    icon={getIconForMetric(metric.title)}
                  />
                </Suspense>
              </div>
            ))}
          </div>

          <div className="bg-white p-4 shadow-md rounded-lg">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">
              Yearly Carbon Emission&apos;s Progress
            </h3>
            <div className="bg-white-200 h-full flex justify-center items-center min-h-[350px]">
              <Suspense
                fallback={
                  <div className="w-full h-[350px] bg-gray-100 animate-pulse rounded-lg" />
                }
              >
                <CarbonEmissionChart
                  monthlyEmissions={monthlyEmissions}
                  averageAbsorbed={averageAbsorbed}
                  onMonthClick={handleMonthSelection}
                  clickedMonthIndex={clickedMonthIndex}
                />
              </Suspense>
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
                <Suspense
                  fallback={
                    <div className="w-full h-40 bg-gray-100 animate-pulse rounded-lg" />
                  }
                >
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
                </Suspense>
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
              <Suspense
                fallback={
                  <div className="w-full h-60 bg-gray-100 animate-pulse rounded-lg" />
                }
              >
                <EmissionCategoryChart
                  categoryData={categoryEmissionsData}
                  month={selectedMonth}
                  onCategoryClick={handleCategoryClick}
                />
              </Suspense>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <Suspense fallback={<LoadingSpinner />}>
          <Modal
            isVisible={showModal}
            category={selectedCategory}
            userId={userId || ""}
            month={selectedMonth}
            year={selectedYear ?? new Date().getFullYear()}
            onClose={closeModal}
          />
        </Suspense>
      )}

      <Suspense fallback={<LoadingSpinner />}>
        <ScopeModal
          isOpen={isScopeModalOpen}
          onClose={() => setIsScopeModalOpen(false)}
          year={selectedYear || new Date().getFullYear()}
          month={typeof selectedMonth === "number" ? selectedMonth : undefined}
          userId={userId || ""}
        />
      </Suspense>
    </div>
  );
};

export default DashboardPage;
