"use client";
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

// MonthlyData and other types based on your previous code
interface MonthlyData {
  equipment: number[];
  livestock: number[];
  crops: number[];
  waste: number[];
  totalMonthlyEmissions: number[];
  totalMonthlyAbsorption: number[];
  netMonthlyEmissions: number[];
  emissionTargets: { [key: number]: number };
}

interface DataPoint {
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

interface NetZeroAnalysis {
  cumulativeNetZeroYear: number | null;
  cumulativeNetZeroMonth: number | null;
  ytdNetEmissions: number | null;
}

interface DataContextType {
  data: MonthlyData | null;
  isLoading: boolean;
  chartData: DataPoint[];
  netZeroAnalysis: NetZeroAnalysis | null;
  setData: (data: MonthlyData) => void;
}

// Create the DataContext
const DataContext = createContext<DataContextType | undefined>(undefined);

interface DataProviderProps {
  children: ReactNode;
}

// API fetch function
const fetchData = async (): Promise<MonthlyData> => {
  const response = await fetch("/api/your-endpoint"); // Replace with actual API endpoint
  return response.json();
};

// Transformation functions
const getLatestTarget = (emissionTargets: {
  [key: number]: number;
}): number => {
  const years = Object.keys(emissionTargets).map(Number);
  if (years.length === 0) return 0.9; // Default 90% if no targets
  const latestYear = Math.max(...years);
  return emissionTargets[latestYear];
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

  // Add projections (simplified version)
  for (let i = 1; i <= 10; i++) {
    // Simplified for brevity; complete based on your logic
  }

  return historicalData;
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
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [chartData, setChartData] = useState<DataPoint[]>([]);
  const [netZeroAnalysis, setNetZeroAnalysis] =
    useState<NetZeroAnalysis | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const fetchedData = await fetchData();
        setData(fetchedData);
        const processedData = prepareYearlyData(fetchedData);
        setChartData(processedData);
        setNetZeroAnalysis(analyzeNetZeroYears(processedData));
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <DataContext.Provider
      value={{ data, isLoading, chartData, netZeroAnalysis, setData }}
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
