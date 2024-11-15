import React, { useState, useEffect, forwardRef } from "react";
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
import { useData } from "@/context/DataContext"; // Import useData hook

interface EmissionsChartProps {
  isLoading?: boolean;
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
  [key: string]: unknown;
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
    payload: DataPoint;
  }>;
  label?: string;
}

interface TooltipItemProps {
  name: string;
  value: number;
  color: string;
  payload: DataPoint;
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const EmissionsChart = forwardRef<HTMLDivElement, EmissionsChartProps>(
  (props, ref) => {
    const {
      isLoading,
      netZeroAnalysis,
      data: contextData,
      chartData,
    } = useData();

    // Initial Logs
    console.log("=== EmissionsChart Render ===");
    console.log("Props:", props);
    console.log("Context Data:", contextData);
    console.log("isLoading:", isLoading);
    console.log("netZeroAnalysis:", netZeroAnalysis);
    console.log("chartData Length:", chartData?.length);
    useEffect(() => {
      console.log("Chart Data:", chartData);
    }, [chartData]);

    const [showNetZeroAlert, setShowNetZeroAlert] = useState(false);

    useEffect(() => {
      console.log(">>> useEffect: Updating showNetZeroAlert");
      console.log("netZeroAnalysis:", netZeroAnalysis);

      const shouldShowAlert =
        netZeroAnalysis !== null &&
        netZeroAnalysis.cumulativeNetZeroYear !== null &&
        netZeroAnalysis.cumulativeNetZeroMonth !== null;

      console.log("Computed shouldShowAlert:", shouldShowAlert);
      setShowNetZeroAlert(shouldShowAlert);
    }, [netZeroAnalysis]);

    // Log after state update (note: state updates are asynchronous)
    useEffect(() => {
      console.log(">>> showNetZeroAlert state updated to:", showNetZeroAlert);
    }, [showNetZeroAlert]);

    const CustomTooltip: React.FC<TooltipProps> = ({
      active,
      payload,
      label,
    }) => {
      if (active && payload && payload.length) {
        return (
          <div className="bg-white p-4 border rounded shadow">
            <p className="font-bold">{label}</p>
            {payload.map((item: TooltipItemProps, index) => (
              <p key={index} style={{ color: item.color }}>
                {item.name}: {Math.round(item.value).toLocaleString()} kg
                {item.name === "Cumulative YTD Net Emissions" &&
                  item.payload.isProjected &&
                  " (Projected)"}
              </p>
            ))}
            {payload[0].payload.isProjected && (
              <p className="text-gray-500 text-sm italic">Projected values</p>
            )}
          </div>
        );
      }
      return null;
    };

    const renderYearlyChart = () => {
      console.log(">>> renderYearlyChart: chartData:", chartData);

      // Modify the filtering condition to exclude data points with all zero values
      const validChartData = chartData.filter((dataPoint) => {
        const isValid =
          dataPoint.year !== undefined &&
          dataPoint.year !== null &&
          (dataPoint.totalEmissions !== 0 ||
            dataPoint.absorption !== 0 ||
            dataPoint.netEmissions !== 0 ||
            dataPoint.cumulativeYTDNetEmissions !== 0 ||
            dataPoint.targetEmissions !== 0);

        if (!isValid) {
          console.log("Filtered out DataPoint:", dataPoint);
        }

        return isValid;
      });

      console.log(">>> validChartData Length:", validChartData.length);

      if (validChartData.length === 0) {
        console.log("No valid data available for the chart.");
        return (
          <div className="h-64 flex items-center justify-center">
            <p>No data available</p>
          </div>
        );
      }

      return (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart
            data={validChartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" tickFormatter={(value) => value.toString()} />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <ReferenceLine
              y={0}
              label="Carbon Neutral"
              stroke="#52c41a"
              strokeDasharray="3 3"
            />
            <Line
              type="monotone"
              dataKey="totalEmissions"
              stroke="#ff4d4f"
              name="Total Emissions"
              strokeWidth={2}
              strokeDasharray="5 5"
            />
            <Line
              type="monotone"
              dataKey="targetEmissions"
              stroke="#faad14"
              name="Target Emissions"
              strokeWidth={2}
              strokeDasharray="5 5"
            />
            <Line
              type="monotone"
              dataKey="netEmissions"
              stroke="#1890ff"
              name="Carbon Neutral Emission YTD"
              strokeWidth={2}
              strokeDasharray="5 5"
            />
            <Line
              type="monotone"
              dataKey="absorption"
              stroke="#52c41a"
              name="Offsets"
              strokeWidth={2}
              strokeDasharray="5 5"
            />
            <Line
              type="monotone"
              dataKey="cumulativeYTDNetEmissions"
              stroke="#722ed1"
              name="Cumulative Carbon Neutral Emissions YTD"
              strokeWidth={2}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      );
    };

    if (isLoading) {
      console.log(">>> EmissionsChart: isLoading is true");
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

    // Log condition values before rendering
    console.log(">>> Before Rendering JSX:");
    console.log("showNetZeroAlert:", showNetZeroAlert);
    console.log("netZeroAnalysis:", netZeroAnalysis);

    if (netZeroAnalysis) {
      console.log(
        "cumulativeNetZeroYear:",
        netZeroAnalysis.cumulativeNetZeroYear
      );
      console.log(
        "cumulativeNetZeroMonth:",
        netZeroAnalysis.cumulativeNetZeroMonth
      );
      if (netZeroAnalysis.cumulativeNetZeroMonth !== null) {
        console.log(
          "Projected Carbon Neutrality:",
          MONTHS[netZeroAnalysis.cumulativeNetZeroMonth],
          netZeroAnalysis.cumulativeNetZeroYear
        );
      }
    }

    return (
      <Card className="w-full" ref={ref}>
        <CardHeader>
          <CardTitle>Carbon Neutral Emission Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          {showNetZeroAlert &&
            netZeroAnalysis &&
            netZeroAnalysis.cumulativeNetZeroYear &&
            netZeroAnalysis.cumulativeNetZeroMonth !== null && (
              <Alert className="mb-4 bg-green-50">
                <AlertTitle className="text-green-800">
                  Carbon Neutral Target
                </AlertTitle>
                <AlertDescription className="text-green-700">
                  Projected to achieve carbon neutrality in{" "}
                  {MONTHS[netZeroAnalysis.cumulativeNetZeroMonth]}{" "}
                  {netZeroAnalysis.cumulativeNetZeroYear}
                </AlertDescription>
              </Alert>
            )}
          <div className="h-[450px]">{renderYearlyChart()}</div>
        </CardContent>
      </Card>
    );
  }
);

EmissionsChart.displayName = "EmissionsChart";

export default EmissionsChart;
