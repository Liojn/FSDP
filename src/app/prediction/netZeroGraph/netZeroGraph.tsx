import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface MonthlyData {
  equipment: number[];
  livestock: number[];
  crops: number[];
  waste: number[];
  totalMonthlyEmissions: number[];
  emissionTargets: { [key: number]: number };
}

interface NetZeroGraphProps {
  data?: MonthlyData;
  isLoading?: boolean;
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

const NetZeroGraph: React.FC<NetZeroGraphProps> = ({ data, isLoading = false }) => {
  const [chartData, setChartData] = useState<DataPoint[]>([]);
  const [yearsToNetZero, setYearsToNetZero] = useState<number | null>(null);
  const [netZeroYear, setNetZeroYear] = useState<number | null>(null);
  const [netZeroTarget, setNetZeroTarget] = useState<number | null>(null);
  const [targetPercentage, setTargetPercentage] = useState<number | null>(null);
  const [minTargetPercentage, setMinTargetPercentage] = useState<number | null>(null);

  const getLatestTarget = (emissionTargets: { [key: number]: number }): number => {
    const years = Object.keys(emissionTargets).map(Number);
    if (years.length === 0) return 0.9;
    const latestYear = Math.max(...years);
    return emissionTargets[latestYear];
  };

  const calculateYearsToNetZero = (initialEmissions: number, currentEmissions: number, targetPercentage: number): [number, number, number] => {
    const targetEmissions = initialEmissions * 0.1; // 10% of initial emissions
    console.log("calculateYearsToNetZero - targetEmissions (netZeroTarget):", targetEmissions);
    const yearsToNetZero = Math.ceil(Math.log(targetEmissions / currentEmissions) / Math.log(1 - targetPercentage));
    const netZeroYear = new Date().getFullYear() + yearsToNetZero;
    return [yearsToNetZero, netZeroYear, targetEmissions];
  };

  const calculateMinimumPercentToNetZeroBy2050 = (initialEmissions: number, currentEmissions: number): [number] => {
    const targetEmissions = initialEmissions * 0.1; // 10% of initial emissions
    const minTargetPercentage = 1 - Math.exp(Math.log(targetEmissions / currentEmissions) / (2050 - new Date().getFullYear()));
    return [minTargetPercentage];
  };

const prepareYearlyData = (): DataPoint[] => {
  if (!data?.totalMonthlyEmissions?.length) {
    return [];
  }

  const currentYear = new Date().getFullYear();
  const historicalData: DataPoint[] = [];
  let lastDataYear = currentYear;
  let previousYearEmissions = 0;
  let currentYearEmissions = 0;
  let latestTarget = getLatestTarget(data.emissionTargets);

  // Calculate initial net zero target (10% of initial emissions)
  const initialEmissions = data.totalMonthlyEmissions.slice(0, 12).reduce((sum, val) => sum + (val || 0), 0);
  const netZeroEmissionTarget = initialEmissions * 0.1;

  // Process historical data
  for (let i = 0; i < data.totalMonthlyEmissions.length; i += 12) {
    const yearSlice = data.totalMonthlyEmissions.slice(i, i + 12);
    if (yearSlice.length === 0) break;

    const year = currentYear - (Math.floor(data.totalMonthlyEmissions.length / 12) - Math.floor(i / 12) - 1);
    const validMonths = yearSlice.filter(val => val !== null && val !== undefined && val > 0);

    if (validMonths.length === 0) continue;

    const totalEmissions = validMonths.reduce((sum, val) => sum + (val || 0), 0);
    const targetEmissions = previousYearEmissions * (1 - (data.emissionTargets[year] || latestTarget));

    const yearData: DataPoint = {
      year,
      totalEmissions,
      targetEmissions,
      netZeroTarget: netZeroEmissionTarget, // Track the net zero target
      isProjected: false,
      monthsPresent: validMonths.length
    };

    if (year === currentYear) {
      currentYearEmissions = totalEmissions;
    }

    lastDataYear = year;
    previousYearEmissions = totalEmissions;
    historicalData.push(yearData);
  }

  // If the net zero target year is beyond the last data year, add projected data until then
  if (yearsToNetZero && netZeroYear && netZeroTarget !== null) {
    let projectedEmissions = currentYearEmissions;
    for (let year = lastDataYear + 1; year <= netZeroYear; year++) {
      projectedEmissions *= (1 - latestTarget); // Applying the reduction rate

      const projectedData: DataPoint = {
        year,
        totalEmissions: projectedEmissions,
        targetEmissions: projectedEmissions, // Projected target emissions decrease
        netZeroTarget: netZeroTarget,
        isProjected: true
      };

      historicalData.push(projectedData);
    }
  }

  return historicalData;
};
useEffect(() => {
  if (!data) return;
  const yearlyData = prepareYearlyData();
  
  // Get the last non-projected data point
  const lastActualDataPoint = yearlyData.filter(point => !point.isProjected).pop();
  
  if (lastActualDataPoint) {
    const currentEmissions = lastActualDataPoint.totalEmissions;
    const initialEmissions = yearlyData[0].totalEmissions;
    const targetPercentage = getLatestTarget(data.emissionTargets);

    
    // testing
    //   console.log({
    //     initialEmissions,
    //     currentEmissions,
    //     targetPercentage
    //   });
    
    // test why net zero line is wrong
    //   console.log({
    //     yearsToNetZero: years,
    //     netZeroYear: year,
    //     netZeroTarget: target
    //   });

    const [years, year, target] = calculateYearsToNetZero(
      initialEmissions,
      currentEmissions,
      targetPercentage
    );

    const [minPercentage] = calculateMinimumPercentToNetZeroBy2050(
      initialEmissions,
      currentEmissions
    );

    // console.log(minPercentage);
    setYearsToNetZero(years);
    setNetZeroYear(year);
    setNetZeroTarget(target);
    setTargetPercentage(targetPercentage * 100);
    setMinTargetPercentage(minPercentage * 100);
  }
  
  setChartData(yearlyData);
}, [data]);

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
            Net Zero Target: {Math.round(netZeroTarget ?? 0).toLocaleString()} kg
          </p>
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
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="year"
            tickFormatter={(value) => value.toString()}
          />
          <YAxis />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="totalEmissions" 
            stroke="#ff4d4f" 
            name="Total Emissions" 
            strokeWidth={2}
            strokeDasharray={(d: any) => d?.isProjected ? "5 5" : "0"}
          />
          <Line 
            type="monotone" 
            dataKey="targetEmissions" 
            stroke="#faad14" 
            name="Target Emissions" 
            strokeWidth={2}
            strokeDasharray="5 5"
          />
          <ReferenceLine 
            y={netZeroTarget ?? 0} 
            label="Carbon Neutral" 
            stroke="#52c41a" 
            strokeDasharray="3 3"
          />
        </LineChart>
      </ResponsiveContainer>
    );
  };

  if (isLoading) {
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
        {yearsToNetZero !== null && netZeroYear !== null && netZeroTarget !== null && (
          <Alert className="mb-4 bg-blue-50">
            <AlertTitle className="text-blue-800">Net Zero Emissions: 90% reduction in emissions from initial emissions</AlertTitle>
            <AlertDescription className="text-blue-700">
              Net Zero Target: {netZeroTarget?.toFixed(0)} kg<br/>
              Target Percentage Reduction: {targetPercentage?.toFixed(0)}%<br/>
              Based on current reduction goals set, it would take you approx <strong>{yearsToNetZero}</strong> years to reach net zero Emissions by <strong>{netZeroYear}</strong>.<br/>
              To hit net zero emissions by <strong>2050</strong>, you have to reduce your emissions by at least <strong>{minTargetPercentage?.toFixed(0)}</strong> per year for future years.
            </AlertDescription>
          </Alert>
        )}
        <div className="h-[450px]">
          {renderYearlyChart()}
        </div>
      </CardContent>
    </Card>
  );
};

export default NetZeroGraph;     



