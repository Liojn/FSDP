import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface MonthlyData {
  equipment: number[];
  livestock: number[];
  crops: number[];
  waste: number[];
  totalMonthlyEmissions: number[];
  totalMonthlyAbsorption: number[];
  netMonthlyEmissions: number[];
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
  [key: string]: any;
}

interface NetZeroAnalysis {
  cumulativeNetZeroYear: number | null;
  cumulativeNetZeroMonth: number | null;
  ytdNetEmissions: number | null;
}

const ANNUAL_EMISSIONS_TARGET = 10000;
const PROJECTION_YEARS = 5;
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const EmissionsChart: React.FC<EmissionsChartProps> = ({ data, isLoading = false }) => {
  const [showNetZeroAlert, setShowNetZeroAlert] = useState(false);
  const [chartData, setChartData] = useState<DataPoint[]>([]);
  const [netZeroAnalysis, setNetZeroAnalysis] = useState<NetZeroAnalysis>({
    cumulativeNetZeroYear: null,
    cumulativeNetZeroMonth: null,
    ytdNetEmissions: null
  });
  

  const calculateMonthlyNetZeroPoint = (data: DataPoint[]): { year: number | null; month: number | null } => {
    let previousPoint: DataPoint | null = null;
    
    for (const point of data) {
      if (point.cumulativeYTDNetEmissions !== undefined) {
        // Check if we've crossed the zero point between this point and the previous point
        if (previousPoint && 
            previousPoint.cumulativeYTDNetEmissions! > 0 && 
            point.cumulativeYTDNetEmissions <= 0) {
          // Linear interpolation to find more precise month
          const totalDays = 365; // Assuming a year
          const daysToZero = Math.abs(previousPoint.cumulativeYTDNetEmissions! / 
            (point.cumulativeYTDNetEmissions - previousPoint.cumulativeYTDNetEmissions!)) * totalDays;
          
          const month = Math.ceil(daysToZero / (totalDays / 12));
          
          return {
            year: point.year || null,
            month: Math.min(month, 12)
          };
        }
        previousPoint = point;
      }
    }
    return { year: null, month: null };
  };

  const calculateYTDNetEmissions = (data: MonthlyData, year: number, previousYearsEmissions: number = 0): number | null => {
    if (!data?.totalMonthlyEmissions?.length || !data?.totalMonthlyAbsorption?.length) {
      return null;
    }

    const currentYear = new Date().getFullYear();
    const currentMonth = year === currentYear ? new Date().getMonth() + 1 : 12;
    
    const yearStartIndex = data.totalMonthlyEmissions.length - ((currentYear - year + 1) * 12);
    const yearEndIndex = yearStartIndex + currentMonth;
    
    const monthlyEmissions = data.totalMonthlyEmissions.slice(yearStartIndex, yearEndIndex);
    const monthlyAbsorption = data.totalMonthlyAbsorption.slice(yearStartIndex, yearEndIndex);
    
    const validMonths = monthlyEmissions.filter(val => val !== null && val !== undefined);
    if (validMonths.length === 0) return null;

    const totalEmissions = validMonths.reduce((sum, val) => sum + (val || 0), 0);
    const totalAbsorption = monthlyAbsorption
      .slice(0, validMonths.length)
      .reduce((sum, val) => sum + (val || 0), 0);
    
    const yearNetEmissions = totalEmissions - totalAbsorption;
    
    return previousYearsEmissions + yearNetEmissions;
  };

  const prepareYearlyData = (): DataPoint[] => {
    if (!data?.totalMonthlyEmissions?.length || !data?.totalMonthlyAbsorption?.length) {
      return [];
    }
    
    const currentYear = new Date().getFullYear();
    const historicalData: DataPoint[] = [];
    let lastDataYear = currentYear;
    let cumulativeNetEmissions = 0;
    
    // Process historical data
    for (let i = 0; i < data.totalMonthlyEmissions.length; i += 12) {
      const yearSlice = data.totalMonthlyEmissions.slice(i, i + 12);
      if (yearSlice.length === 0) break;
      
      const year = currentYear - (Math.floor(data.totalMonthlyEmissions.length / 12) - Math.floor(i / 12) - 1);
      const validMonths = yearSlice.filter(val => val !== null && val !== undefined && val > 0);
      
      if (validMonths.length === 0) continue;

      const totalEmissions = validMonths.reduce((sum, val) => sum + (val || 0), 0);
      const totalAbsorption = data.totalMonthlyAbsorption
        .slice(i, i + validMonths.length)
        .reduce((sum, val) => sum + (val || 0), 0);

      const netEmissions = totalEmissions - totalAbsorption;
      cumulativeNetEmissions += netEmissions;

      const yearData: DataPoint = {
        year,
        totalEmissions,
        absorption: totalAbsorption,
        netEmissions,
        cumulativeYTDNetEmissions: cumulativeNetEmissions,
        isProjected: false,
        monthsPresent: validMonths.length
      };
      
      lastDataYear = year;
      historicalData.push(yearData);
    }

    // Add projections for future years
    const projectedData: DataPoint[] = [];
    if (historicalData.length > 0 && cumulativeNetEmissions > 0) {
      let projectedEmissions = ANNUAL_EMISSIONS_TARGET;
      const lastYear = historicalData[historicalData.length - 1];
      const annualAbsorption = (lastYear.absorption / lastYear.monthsPresent!) * 12;
      
      for (let i = 1; i <= PROJECTION_YEARS; i++) {
        const projectedYear = lastDataYear + i;
        const projectedNetEmissions = projectedEmissions - annualAbsorption;
        cumulativeNetEmissions += projectedNetEmissions;
        
        projectedData.push({
          year: projectedYear,
          totalEmissions: projectedEmissions,
          absorption: annualAbsorption,
          netEmissions: projectedNetEmissions,
          cumulativeYTDNetEmissions: cumulativeNetEmissions,
          isProjected: true,
          monthsPresent: 12
        });

        if (cumulativeNetEmissions <= 0) break;
        projectedEmissions *= 0.9;
      }
    }

    return [...historicalData, ...projectedData];
  };

  const analyzeNetZeroYears = (chartData: DataPoint[]): NetZeroAnalysis => {
    if (!chartData.length) {
      return {
        cumulativeNetZeroYear: null,
        cumulativeNetZeroMonth: null,
        ytdNetEmissions: null
      };
    }

    const { year: netZeroYear, month: netZeroMonth } = calculateMonthlyNetZeroPoint(chartData);
    const currentYear = new Date().getFullYear();
    const currentYearData = chartData.find(d => d.year === currentYear);
    
    return {
      cumulativeNetZeroYear: netZeroYear,
      cumulativeNetZeroMonth: netZeroMonth,
      ytdNetEmissions: currentYearData?.cumulativeYTDNetEmissions || null
    };
  };

  useEffect(() => {
    if (!data) return;
    
    const yearlyData = prepareYearlyData();
    setChartData(yearlyData);
    
    const analysis = analyzeNetZeroYears(yearlyData);    
    setNetZeroAnalysis(analysis);
    setShowNetZeroAlert(analysis.cumulativeNetZeroYear !== null);
  }, [data]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border rounded shadow">
          <p className="font-bold">{label}</p>
          {payload.map((item: any, index: number) => (
            <p key={index} style={{ color: item.color }}>
              {item.name}: {Math.round(item.value).toLocaleString()} kg
              {item.name === "Cumulative YTD Net Emissions" && item.payload.isProjected && " (Projected)"}
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
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="year"
            tickFormatter={(value) => value.toString()}
          />
          <YAxis />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <ReferenceLine 
            y={0} 
            label="Net Zero" 
            stroke="#52c41a" 
            strokeDasharray="3 3"
          />
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
            dataKey="netEmissions" 
            stroke="#1890ff" 
            name="Carbon Neutral Emissions" 
            strokeWidth={2}
            strokeDasharray={(d: any) => d?.isProjected ? "5 5" : "0"}
          />
          <Line 
            type="monotone" 
            dataKey="absorption" 
            stroke="#52c41a" 
            name="Offsets" 
            strokeWidth={2}
            strokeDasharray={(d: any) => d?.isProjected ? "5 5" : "0"}
          />
          <Line 
            type="monotone" 
            dataKey="cumulativeYTDNetEmissions" 
            stroke="#722ed1" 
            name="Cumulative YTD Carbon Neutral Emissions" 
            strokeWidth={2}
            dot={{ r: 4 }}
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
        <CardTitle>Carbon Neutral Emission Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        {showNetZeroAlert && netZeroAnalysis.ytdNetEmissions !== null && (
          <Alert className="mb-4 bg-green-50">
            <AlertTitle className="text-green-800">Carbon Neutral Progress</AlertTitle>
            <AlertDescription className="text-green-700">
              <div className="space-y-2">
                {netZeroAnalysis.cumulativeNetZeroYear && netZeroAnalysis.cumulativeNetZeroMonth && (
                  <div>
                    Based on current projections, carbon neutral will be achieved in {MONTHS[netZeroAnalysis.cumulativeNetZeroMonth - 1]} {netZeroAnalysis.cumulativeNetZeroYear}
                  </div>
                )}
              </div>
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

export default EmissionsChart;