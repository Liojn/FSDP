/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useData } from "@/context/DataContext";
interface MonthlyData {
  equipment: number[];
  livestock: number[];
  crops: number[];
  waste: number[];
  totalMonthlyEmissions: number[];
  emissionTargets: { [key: number]: number };
}
interface DataPoint {
  year?: number;
  totalEmissions: number;
  targetEmissions?: number;
  netZeroTarget?: number;
  isProjected: boolean;
  monthsPresent?: number;
  yearsToTarget?: number;
  [key: string]: any;
}

interface NetZeroGraphProps {
  data?: MonthlyData;
  isLoading?: boolean;
}
const calculateLinearRegression = (
  data: DataPoint[]
): { slope: number; intercept: number } => {
  const actualData = data.filter((point) => !point.isProjected);
  const n = actualData.length;

  if (n < 2) return { slope: 0, intercept: 0 };

  const sumX = actualData.reduce((sum, point) => sum + (point.year || 0), 0);
  const sumY = actualData.reduce((sum, point) => sum + point.totalEmissions, 0);
  const sumXY = actualData.reduce(
    (sum, point) => sum + (point.year || 0) * point.totalEmissions,
    0
  );
  const sumXX = actualData.reduce(
    (sum, point) => sum + (point.year || 0) * (point.year || 0),
    0
  );

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  return { slope, intercept };
};

const NetZeroGraph: React.FC<NetZeroGraphProps> = ({
  data: propsData,
  isLoading: propsIsLoading = false,
}) => {
  const { data: contextData, isLoading: contextIsLoading } = useData(); // Get data and isLoading from context

  // Use props if provided, otherwise fallback to context
  const data = propsData ?? contextData;
  const isLoading = propsIsLoading || contextIsLoading;

  const [chartData, setChartData] = useState<DataPoint[]>([]);
  const [yearsToNetZero, setYearsToNetZero] = useState<number | null>(null);
  const [netZeroYear, setNetZeroYear] = useState<number | null>(null);
  const [netZeroTarget, setNetZeroTarget] = useState<number | null>(null);
  const [targetPercentage, setTargetPercentage] = useState<number | null>(null);
  const [minTargetPercentage, setMinTargetPercentage] = useState<number | null>(
    null
  );
  const [predictedNetZeroYear, setPredictedNetZeroYear] = useState<
    number | null
  >(null);

  console.log("NetZeroGraph rendered");
  console.log("Received propsData:", propsData);
  console.log("Received contextData:", contextData);
  console.log("Using data:", data);
  console.log("Sample chart data:", chartData.slice(0, 5));

  const getLatestTarget = (emissionTargets: {
    [key: number]: number;
  }): number => {
    const years = Object.keys(emissionTargets).map(Number);
    if (years.length === 0) return 0.1;
    const latestYear = Math.max(...years);
    return emissionTargets[latestYear];
  };

  // use logarithmic equation to make the graph for a curved graph instead of a linear straight line graph
  const calculateYearsToNetZero = (
    initialEmissions: number,
    currentEmissions: number,
    targetPercentage: number
  ): [number, number, number] => {
    const targetEmissions = initialEmissions * 0.1; // 10% of initial emissions
    const yearsToNetZero = Math.ceil(
      Math.log(targetEmissions / currentEmissions) /
        Math.log(1 - targetPercentage)
    ); // Manipulation from [targetEmission = (current * targetPercentage^(no. of years))]
    const netZeroYear = new Date().getFullYear() + yearsToNetZero;
    return [yearsToNetZero, netZeroYear, targetEmissions];
  };

  // net zero goal by 2050
  const calculateMinimumPercentToNetZeroBy2050 = (
    initialEmissions: number,
    currentEmissions: number
  ): [number] => {
    const targetEmissions = initialEmissions * 0.1;
    const minTargetPercentage =
      1 -
      Math.exp(
        Math.log(targetEmissions / currentEmissions) /
          (2050 - new Date().getFullYear())
      ); // Manipulation from [targetEmission = (current * targetPercentage^(no. of years))]
    return [minTargetPercentage];
  };


  const prepareYearlyData = useCallback((): DataPoint[] => {
    if (!data?.totalMonthlyEmissions?.length) {
      console.log("No monthly emissions data available in `data`");
      return [];
    }

    const currentYear = new Date().getFullYear();
    const historicalData: DataPoint[] = [];
    let lastDataYear = currentYear;
    let previousYearEmissions = 0;
    let currentYearEmissions = 0;
    const latestTarget = getLatestTarget(data.emissionTargets);

    console.log("Preparing yearly data with latest target:", latestTarget);

    const initialEmissions = data.totalMonthlyEmissions
      .slice(0, 12)
      .reduce((sum, val) => sum + (val || 0), 0);
    const netZeroEmissionTarget = initialEmissions * 0.1; // net zero is 90% reduction

    for (let i = 0; i < data.totalMonthlyEmissions.length; i += 12) {
      const yearSlice = data.totalMonthlyEmissions.slice(i, i + 12);
      if (yearSlice.length === 0) break;

      const year =
        currentYear -
        (Math.floor(data.totalMonthlyEmissions.length / 12) -
          Math.floor(i / 12) -
          1);
      const validMonths = yearSlice.filter(
        (val) => val !== null && val !== undefined && val > 0
      );

      if (validMonths.length === 0) continue;

      const totalEmissions = validMonths.reduce(
        (sum, val) => sum + (val || 0),
        0
      );
      const targetEmissions =
        previousYearEmissions *
        (1 - (data.emissionTargets[year] || latestTarget));

      const yearData: DataPoint = {
        year,
        totalEmissions,
        targetEmissions,
        netZeroTarget: netZeroEmissionTarget,
        isProjected: false,
        monthsPresent: validMonths.length,
      };

      if (year === currentYear) {
        currentYearEmissions = totalEmissions;
      }

      lastDataYear = year;
      previousYearEmissions = totalEmissions;
      historicalData.push(yearData);
    }

    console.log("Historical data prepared:", historicalData);

    if (yearsToNetZero && netZeroYear && netZeroTarget !== null) {
      let projectedEmissions = currentYearEmissions;
      for (let year = lastDataYear + 1; year <= netZeroYear; year++) {
        projectedEmissions *= 1 - latestTarget;

        const projectedData: DataPoint = {
          year,
          totalEmissions: projectedEmissions,
          targetEmissions: projectedEmissions,
          netZeroTarget: netZeroTarget,
          isProjected: true,
        };

        historicalData.push(projectedData);
      }
      console.log(
        "Projected data prepared:",
        historicalData.slice(historicalData.length - 5)
      );
    }

    const { slope, intercept } = calculateLinearRegression(historicalData);

    // Add trend line values to each data point
    return historicalData.map((point) => ({
      ...point,
      trendLine: slope * (point.year || 0) + intercept,
    }));
  }, [data, netZeroTarget, netZeroYear, yearsToNetZero]);

  useEffect(() => {
    if (!data) {
      console.log("Data is null or undefined");
      return;
    }
    const yearlyData = prepareYearlyData();

    if (!yearlyData.length) {
      console.log("Yearly data preparation returned empty");
      return;
    }

    const lastActualDataPoint = yearlyData
      .filter((point) => !point.isProjected)
      .pop();

    if (lastActualDataPoint) {
      const currentEmissions = lastActualDataPoint.totalEmissions;
      const initialEmissions = yearlyData[0].totalEmissions;
      const targetPercentage = getLatestTarget(data.emissionTargets);

      const [years, year, target] = calculateYearsToNetZero(
        initialEmissions,
        currentEmissions,
        targetPercentage
      );

      const [minPercentage] = calculateMinimumPercentToNetZeroBy2050(
        initialEmissions,
        currentEmissions
      );

      setYearsToNetZero(years);
      setNetZeroYear(year);
      setNetZeroTarget(target);
      setTargetPercentage(targetPercentage * 100);
      setMinTargetPercentage(minPercentage * 100);

      // Calculate predicted net zero year based on trend line
      const { slope, intercept } = calculateLinearRegression(yearlyData);
      if (slope < 0) {
        // Only calculate if emissions are decreasing
        const predictedYear = Math.ceil((target - intercept) / slope);
        setPredictedNetZeroYear(predictedYear);
      } else {
        setPredictedNetZeroYear(null);
      }
      console.log("Calculated values:", { years, year, target, minPercentage });
    }

    setChartData(yearlyData);
    console.log("Set chart data:", yearlyData);
  }, [data, prepareYearlyData]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border rounded shadow">
          <p className="font-bold">{label}</p>
          {payload.map((item: any, index: number) => (
            <p key={index} style={{ color: item.color }}>
              {item.name}: {Math.round(item.value).toLocaleString()} kg
              {item.payload.isProjected && " (Projected)"}
            </p>
          ))}
          {payload[0].payload.isProjected && (
            <p className="text-gray-500 text-sm italic">Projected values</p>
          )}
          {netZeroTarget !== undefined && (
            <p className="text-blue-500 font-semibold">
              Net Zero Target: {Math.round(netZeroTarget ?? 0).toLocaleString()}{" "}
              kg
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  const renderYearlyChart = () => {
    console.log("Rendering chart with data:", chartData);
    if (chartData.length === 0) {
      return (
        <div className="h-64 flex items-center justify-center">
          <p>No data available</p>
        </div>
      );
    }

    return (
      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="year" tickFormatter={(value) => value.toString()} />
          <YAxis />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line
            type="monotone"
            dataKey="totalEmissions"
            stroke="#ff4d4f"
            name="Total Emissions"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="targetEmissions"
            stroke="#faad14"
            name="Target Emissions"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
          />
          <ReferenceLine
            y={netZeroTarget ?? 0}
            label="Net Zero"
            stroke="#52c41a"
            strokeDasharray="3 3"
          />
          <Line
            type="monotone"
            dataKey="trendLine"
            stroke="#8884d8"
            name="Trend Line"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  };

  if (isLoading) {
    console.log("Component is loading");
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="h-64 flex items-center justify-center">
            <p>Loading chart data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Net Zero Emission Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        {yearsToNetZero !== null &&
          netZeroYear !== null &&
          netZeroTarget !== null && (
            <Alert className="mb-4 bg-blue-50">
              <AlertTitle className="text-blue-800">
                Net Zero Emissions: 90% reduction in emissions from initial
                emissions
              </AlertTitle>
              <AlertDescription className="text-blue-700">
                Net Zero Target: {netZeroTarget?.toFixed(0)} kg
                <br />
                Target Percentage Reduction: {targetPercentage?.toFixed(0)}%
                <br/>
                To hit net zero emissions by <strong>2050</strong>, you have to
                reduce your emissions by at least{" "}
                <strong>{minTargetPercentage?.toFixed(0)}%</strong> per year for
                future years.
                <br />
                Based on current reduction goals set, it would take you approximately{" "}
                <strong>{yearsToNetZero}</strong> years to reach net zero
                emissions in <strong>{netZeroYear}</strong>.
                <br />
                {predictedNetZeroYear ? (
                  predictedNetZeroYear <= 2050 ? (
                    <span>Based on your current data trend, you are on track to reach net zero by <strong>{predictedNetZeroYear}</strong>, ahead of the <strong>2050</strong> target</span>
                  ) : (
                    <span>Based on your current data trend, you are predicted to hit net zero around <strong>{predictedNetZeroYear}</strong>, falling behind the <strong>2050</strong> target</span>
                  )
                ) : (
                  "There is not enough data to show a prediction trend for your company."
                )}
              </AlertDescription>
            </Alert>
          )}
        <div className="h-[450px]">{renderYearlyChart()}</div>
      </CardContent>
    </Card>
  );
};

export default NetZeroGraph;
