import React, { useState, useEffect } from "react";
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

interface EmissionsChartProps {
  data?: MonthlyData;
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

interface NetZeroAnalysis {
  cumulativeNetZeroYear: number | null;
  cumulativeNetZeroMonth: number | null;
  ytdNetEmissions: number | null;
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

const PROJECTION_YEARS = 10;
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
const PROJECTION_YEARS = 100;
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

const EmissionsChart = React.forwardRef<HTMLDivElement, EmissionsChartProps>(
  ({ data }, ref) => {
    const { isLoading, netZeroAnalysis: initialNetZeroAnalysis } = useData();
    const [netZeroAnalysis, setNetZeroAnalysis] = useState<NetZeroAnalysis>(
      initialNetZeroAnalysis || {
        cumulativeNetZeroYear: null,
        cumulativeNetZeroMonth: null,
        ytdNetEmissions: null,
      }
    );
    const [chartData, setChartData] = useState<DataPoint[]>([]);
    const [showNetZeroAlert, setShowNetZeroAlert] = useState(false);

    const calculateMonthlyNetZeroPoint = (
      data: DataPoint[]
    ): { year: number | null; month: number | null } => {
      let previousPoint: DataPoint | null = null;

      for (const point of data) {
        if (point.cumulativeYTDNetEmissions !== undefined) {
          if (
            previousPoint &&
            previousPoint.cumulativeYTDNetEmissions! > 0 &&
            point.cumulativeYTDNetEmissions <= 0
          ) {
            const totalDays = 365;
            const daysToZero =
              Math.abs(
                previousPoint.cumulativeYTDNetEmissions! /
                  (point.cumulativeYTDNetEmissions -
                    previousPoint.cumulativeYTDNetEmissions!)
              ) * totalDays;

            const month = Math.floor(daysToZero / (totalDays / 12));

            return {
              year: previousPoint.year || null,
              month: Math.min(month, 11), // Using 0-based month index
            };
          }
          previousPoint = point;
        }
      }
      return { year: null, month: null };
    };

    const getLatestTarget = (emissionTargets: {
      [key: number]: number;
    }): number => {
      const years = Object.keys(emissionTargets).map(Number);
      if (years.length === 0) return 0.9; // Default 90% if no targets
      const latestYear = Math.max(...years);
      return emissionTargets[latestYear];
    };

    const prepareYearlyData = (): DataPoint[] => {
      if (
        !data?.totalMonthlyEmissions?.length ||
        !data?.totalMonthlyAbsorption?.length
      ) {
        return [];
      }

      const currentYear = new Date().getFullYear();
      const historicalData: DataPoint[] = [];
      let lastDataYear = currentYear;
      let cumulativeNetEmissions = 0;
      let previousYearEmissions = 0;
      const latestTarget = getLatestTarget(data.emissionTargets);
      let latestAnnualAbsorption = 0;

      // Process historical data
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
        const totalAbsorption = data.totalMonthlyAbsorption
          .slice(i, i + validMonths.length)
          .reduce((sum, val) => sum + (val || 0), 0);

        latestAnnualAbsorption = (totalAbsorption / validMonths.length) * 12;

        const netEmissions = totalEmissions - totalAbsorption;
        cumulativeNetEmissions += netEmissions;

        const targetEmissions =
          previousYearEmissions *
          (1 - (data.emissionTargets[year] || latestTarget));

        const yearData: DataPoint = {
          year,
          totalEmissions,
          absorption: totalAbsorption,
          netEmissions,
          cumulativeYTDNetEmissions: cumulativeNetEmissions,
          isProjected: false,
          monthsPresent: validMonths.length,
          targetEmissions,
        };

        lastDataYear = year;
        previousYearEmissions = totalEmissions;
        historicalData.push(yearData);
      }

      // Add projections for future years
      const projectedData: DataPoint[] = [];
      if (historicalData.length > 0 && cumulativeNetEmissions > 0) {
        let projectedEmissions = previousYearEmissions;

        for (let i = 1; i <= PROJECTION_YEARS; i++) {
          const projectedYear = lastDataYear + i;
          const targetPercentage =
            data.emissionTargets[projectedYear] || latestTarget;
          projectedEmissions *= 1 - targetPercentage;

          const projectedNetEmissions =
            projectedEmissions - latestAnnualAbsorption;
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
      if (!chartData.length) {
        return {
          cumulativeNetZeroYear: null,
          cumulativeNetZeroMonth: null,
          ytdNetEmissions: null,
        };
      }

      const { year: netZeroYear, month: netZeroMonth } =
        calculateMonthlyNetZeroPoint(chartData);
      const currentYear = new Date().getFullYear();
      const currentYearData = chartData.find((d) => d.year === currentYear);

      return {
        cumulativeNetZeroYear: netZeroYear,
        cumulativeNetZeroMonth: netZeroMonth,
        ytdNetEmissions: currentYearData?.cumulativeYTDNetEmissions || null,
      };
    };

    useEffect(() => {
      if (!data) return;

      const yearlyData = prepareYearlyData();
      setChartData(yearlyData);

      const analysis = analyzeNetZeroYears(yearlyData);
      setNetZeroAnalysis(analysis);
      setShowNetZeroAlert(
        analysis.cumulativeNetZeroYear !== null &&
          analysis.cumulativeNetZeroMonth !== null
      );
    }, [data]);

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
      return (
        <Card className="w-full" ref={ref}>
          <CardContent className="p-6">
            <div className="h-64 flex items-center justify-center">
              <p>Loading chart data...</p>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className="w-full" ref={ref}>
        <CardHeader>
          <CardTitle>Carbon Neutral Emission Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          {showNetZeroAlert &&
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
