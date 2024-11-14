"use client";
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { createContext, useContext, useState, ReactNode } from "react";

// MonthlyData and other types based on your previous code
export interface MonthlyData {
  equipment: number[];
  livestock: number[];
  crops: number[];
  waste: number[];
  totalMonthlyEmissions: number[];
  totalMonthlyAbsorption: number[];
  netMonthlyEmissions: number[];
  emissionTargets: { [key: number]: number };
}

export interface DataPoint {
  year?: number;
  month?: number;
  name?: string;
  totalEmissions: number;
  absorption: number;
  netEmissions: number;
  cumulativeYTDNetEmissions?: number;
  isProjected: boolean;
  monthsPresent?: number;
  targetEmissions?: number;
}

export interface NetZeroAnalysis {
  cumulativeNetZeroYear: number | null;
  cumulativeNetZeroMonth: number | null;
  ytdNetEmissions: number | null;
}

interface DataContextType {
  data: MonthlyData | null;
  chartData: DataPoint[];
  netZeroAnalysis: NetZeroAnalysis | null;
  setData: (data: MonthlyData) => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
}

// Create the DataContext
const DataContext = createContext<DataContextType | undefined>(undefined);

interface DataProviderProps {
  children: ReactNode;
}

// Transformation functions
const getLatestTarget = (emissionTargets: {
  [key: number]: number;
}): number => {
  const years = Object.keys(emissionTargets).map(Number);
  return years.length === 0 ? 0.9 : emissionTargets[Math.max(...years)];
};

const prepareYearlyData = (data: MonthlyData): DataPoint[] => {
  const currentYear = new Date().getFullYear();
  const historicalData: DataPoint[] = [];
  let lastDataYear = currentYear;
  let cumulativeNetEmissions = 0;
  let previousYearEmissions = 0;
  const latestTarget = getLatestTarget(data.emissionTargets);
  let latestAnnualAbsorption = 0;

  for (let i = 0; i < data.totalMonthlyEmissions.length; i += 12) {
    const yearSlice = data.totalMonthlyEmissions.slice(i, i + 12);
    const year =
      currentYear -
      (Math.floor(data.totalMonthlyEmissions.length / 12) -
        Math.floor(i / 12) -
        1);
    const validMonths = yearSlice.filter((val) => val > 0);

    const totalEmissions = validMonths.reduce(
      (sum, val) => sum + (val || 0),
      0
    );
    const totalAbsorption = data.totalMonthlyAbsorption
      .slice(i, i + validMonths.length)
      .reduce((sum, val) => sum + (val || 0), 0);
    latestAnnualAbsorption = (totalAbsorption / validMonths.length) * 12;

    const netEmissions = totalEmissions - totalAbsorption;
    cumulativeNetEmissions += netEmissions;
    const targetEmissions =
      previousYearEmissions *
      (1 - (data.emissionTargets[year] || latestTarget));

    historicalData.push({
      year,
      totalEmissions,
      absorption: totalAbsorption,
      netEmissions,
      cumulativeYTDNetEmissions: cumulativeNetEmissions,
      isProjected: false,
      monthsPresent: validMonths.length,
      targetEmissions,
    });

    lastDataYear = year;
    previousYearEmissions = totalEmissions;
  }

  const projectedData: DataPoint[] = [];
  if (historicalData.length > 0 && cumulativeNetEmissions > 0) {
    let projectedEmissions = previousYearEmissions;

    for (let i = 1; i <= 10; i++) {
      const projectedYear = lastDataYear + i;
      const targetPercentage =
        data.emissionTargets[projectedYear] || latestTarget;
      projectedEmissions *= 1 - targetPercentage;

      const projectedNetEmissions = projectedEmissions - latestAnnualAbsorption;
      cumulativeNetEmissions += projectedNetEmissions;

      projectedData.push({
        year: projectedYear,
        totalEmissions: projectedEmissions,
        absorption: latestAnnualAbsorption,
        netEmissions: projectedNetEmissions,
        cumulativeYTDNetEmissions: cumulativeNetEmissions,
        isProjected: true,
        monthsPresent: 12,
        targetEmissions: projectedEmissions,
      });

      if (cumulativeNetEmissions <= 0) break;
    }
  }

  return [...historicalData, ...projectedData];
};

const analyzeNetZeroYears = (chartData: DataPoint[]): NetZeroAnalysis => {
  let cumulativeNetZeroYear = null;
  let cumulativeNetZeroMonth = null;
  let ytdNetEmissions: number | null = null;

  const lastPoint = chartData[chartData.length - 1];
  if (lastPoint) {
    ytdNetEmissions = lastPoint.cumulativeYTDNetEmissions ?? null;
    if (ytdNetEmissions && ytdNetEmissions <= 0) {
      cumulativeNetZeroYear = lastPoint.year ?? null;
      cumulativeNetZeroMonth = 11; // Assume December
    }
  }
  return { cumulativeNetZeroYear, cumulativeNetZeroMonth, ytdNetEmissions };
};

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const [data, setData] = useState<MonthlyData | null>(null);
  const [chartData, setChartData] = useState<DataPoint[]>([]);
  const [netZeroAnalysis, setNetZeroAnalysis] =
    useState<NetZeroAnalysis | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);

  React.useEffect(() => {
    if (data) {
      const processedData = prepareYearlyData(data);
      setChartData(processedData);
      setNetZeroAnalysis(analyzeNetZeroYears(processedData));
      setIsLoading(false);
    }
  }, [data]);

  return (
    <DataContext.Provider
      value={{
        data,
        chartData,
        netZeroAnalysis,
        setData,
        isLoading,
        setIsLoading,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

// Hook for consuming the context
export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};
