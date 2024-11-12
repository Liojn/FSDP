"use client";

import { useState, useEffect } from 'react';
import EmissionsChart from './predictionComponents/predictionGraph';
import { Card, CardContent } from '@/components/ui/card';
import { PageHeader } from '@/components/shared/page-header';
import { 
  Target, 
  Leaf,
  TrendingDown,
  AlertTriangle
} from 'lucide-react';

interface MonthlyData {
  equipment: number[];
  livestock: number[];
  crops: number[];
  waste: number[];
  totalMonthlyEmissions: number[];
  totalMonthlyAbsorption: number[];
  netMonthlyEmissions: number[];
}

interface PredictionResponse {
  monthlyData: MonthlyData;
}

interface UserGoals {
  annualEmissionsTarget: number;
  targetYear: number;
  percentageReduction: number;
}

interface EmissionsStats {
  netReductionRate: number;
  peakEmissionsYear: {
    year: number;
    amount: number;
  };
  totalNetEmissionsYTD: number;
  cumulativeEmissions: number;
  emissionsBySource: {
    equipment: number;
    livestock: number;
    crops: number;
    waste: number;
  };
  monthlyAverages: {
    emissions: number;
    absorption: number;
    net: number;
  };
  trends: {
    isIncreasing: boolean;
    monthsToTarget: number;
    percentageToTarget: number;
  };
}

interface YearlyDataPoint {
  year: number;
  totalEmissions: number;
  absorption: number;
  netEmissions: number;
  cumulativeYTDNetEmissions: number;
  isProjected: boolean;
  monthsPresent: number;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function PredictionPage() {
  const [data, setData] = useState<PredictionResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [emissionsStats, setEmissionsStats] = useState<EmissionsStats | null>(null);
  const [userGoals, setUserGoals] = useState<UserGoals>({
    annualEmissionsTarget: 10000,
    targetYear: 2030,
    percentageReduction: 50
  });

  const prepareYearlyData = (data: MonthlyData): YearlyDataPoint[] => {
    const currentYear = new Date().getFullYear();
    let cumulativeNetEmissions = 0;
    const yearlyData: YearlyDataPoint[] = [];
    
    // Process data year by year
    for (let i = 0; i < data.totalMonthlyEmissions.length; i += 12) {
      const yearSlice = data.totalMonthlyEmissions.slice(i, i + 12);
      if (yearSlice.length === 0) break;
      
      const projectionYear: number = currentYear - (Math.floor(data.totalMonthlyEmissions.length / 12) - Math.floor(i / 12) - 1);
      const validMonths = yearSlice.filter(val => val !== null && val !== undefined && val > 0);
      
      if (validMonths.length === 0) continue;

      const totalEmissions = validMonths.reduce((sum, val) => sum + (val || 0), 0);
      const totalAbsorption = data.totalMonthlyAbsorption
        .slice(i, i + validMonths.length)
        .reduce((sum, val) => sum + (val || 0), 0);

      const netEmissions = totalEmissions - totalAbsorption;
      cumulativeNetEmissions += netEmissions;

      yearlyData.push({
        year: projectionYear,
        totalEmissions,
        absorption: totalAbsorption,
        netEmissions,
        cumulativeYTDNetEmissions: cumulativeNetEmissions,
        isProjected: false,
        monthsPresent: validMonths.length
      });
    }

    return yearlyData;
  };

  useEffect(() => {
    const fetchHistoricalData = async () => {
      const userName = localStorage.getItem('userName');
      try {
        const endYear = new Date().getFullYear();
        const startYear = endYear - 4;
        
        const promises = Array.from({ length: 5 }, (_, i) => {
          return fetch('/api/prediction', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'userName': userName || ''
            },
            body: JSON.stringify({
              endYear: startYear + i,
              dataType: 'carbon-emissions'
            })
          }).then(res => res.json());
        });

        const results = await Promise.all(promises);
        
        const combinedData: MonthlyData = {
          equipment: [],
          livestock: [],
          crops: [],
          waste: [],
          totalMonthlyEmissions: [],
          totalMonthlyAbsorption: [],
          netMonthlyEmissions: []
        };

        results.forEach(result => {
          Object.keys(result.monthlyData).forEach(key => {
            combinedData[key as keyof MonthlyData] = [...combinedData[key as keyof MonthlyData], ...result.monthlyData[key as keyof MonthlyData]];
          });
        });

        const yearlyData = prepareYearlyData(combinedData);
        const stats = calculateEmissionsStats(combinedData, yearlyData);
        setEmissionsStats(stats);
        setData({ monthlyData: combinedData });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistoricalData();
  }, []);

  const calculateEmissionsStats = (data: MonthlyData, yearlyData: YearlyDataPoint[]): EmissionsStats => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);
    const ytdMonths = Math.floor((currentDate.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24 * 30));

    // Find year with highest net emissions
    const peakEmissionsYear = yearlyData.reduce((max, current) => {
      return current.netEmissions > max.amount 
        ? { year: current.year, amount: current.netEmissions }
        : max;
    }, { year: yearlyData[0].year, amount: yearlyData[0].netEmissions });

    // YTD and cumulative calculations
    const ytdNetEmissions = data.netMonthlyEmissions.slice(-ytdMonths).reduce((a, b) => a + b, 0);
    const cumulativeEmissions = data.netMonthlyEmissions.reduce((a, b) => a + b, 0);

    // Last 12 months emissions by source
    const last12Months = {
      equipment: data.equipment.slice(-12).reduce((a, b) => a + b, 0),
      livestock: data.livestock.slice(-12).reduce((a, b) => a + b, 0),
      crops: data.crops.slice(-12).reduce((a, b) => a + b, 0),
      waste: data.waste.slice(-12).reduce((a, b) => a + b, 0)
    };

    // Monthly averages
    const last6MonthsEmissions = data.totalMonthlyEmissions.slice(-6);
    const last6MonthsAbsorption = data.totalMonthlyAbsorption.slice(-6);
    const last6MonthsNet = data.netMonthlyEmissions.slice(-6);

    const monthlyAverages = {
      emissions: last6MonthsEmissions.reduce((a, b) => a + b, 0) / 6,
      absorption: last6MonthsAbsorption.reduce((a, b) => a + b, 0) / 6,
      net: last6MonthsNet.reduce((a, b) => a + b, 0) / 6
    };

    // Calculate trends
    const thisYearNet = data.netMonthlyEmissions.slice(-12).reduce((a, b) => a + b, 0);
    const lastYearNet = data.netMonthlyEmissions.slice(-24, -12).reduce((a, b) => a + b, 0);
    const netReductionRate = ((lastYearNet - thisYearNet) / Math.abs(lastYearNet)) * 100;

    // Trend analysis
    const last3MonthsAvg = data.netMonthlyEmissions.slice(-3).reduce((a, b) => a + b, 0) / 3;
    const previous3MonthsAvg = data.netMonthlyEmissions.slice(-6, -3).reduce((a, b) => a + b, 0) / 3;
    const isIncreasing = last3MonthsAvg > previous3MonthsAvg;

    // Calculate months to target and percentage
    const monthsToTarget = Math.ceil((monthlyAverages.net - userGoals.annualEmissionsTarget) / (monthlyAverages.net * 0.05));
    const percentageToTarget = ((userGoals.annualEmissionsTarget - monthlyAverages.net) / userGoals.annualEmissionsTarget) * 100;

    return {
      netReductionRate,
      peakEmissionsYear,
      totalNetEmissionsYTD: ytdNetEmissions,
      cumulativeEmissions,
      emissionsBySource: last12Months,
      monthlyAverages,
      trends: {
        isIncreasing,
        monthsToTarget,
        percentageToTarget
      }
    };
  };

  const formatNumber = (num: number): string => {
    if (Math.abs(num) >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (Math.abs(num) >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toFixed(1);
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Dashboard Header */}
      <div className="pt-0 flex justify-between items-center mb-4">
        <PageHeader title='NET ZERO Prediction' />
      </div>
      <EmissionsChart data={data?.monthlyData} isLoading={isLoading} />

      {!isLoading && emissionsStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Emission Goals Card */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Emissions Goal</p>
                  <p className="text-2xl font-bold">
                    {formatNumber(userGoals.annualEmissionsTarget)} kg
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Target by {userGoals.targetYear} ({userGoals.percentageReduction}% reduction)
                  </p>
                </div>
                <Target className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          {/* Livestock Emissions Card */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Livestock Emissions</p>
                  <p className="text-2xl font-bold">
                    {formatNumber(emissionsStats.emissionsBySource.livestock)} kg
                  </p>
                  <p className="text-xs text-gray-400 mt-1">annual livestock impact</p>
                </div>
                <Leaf className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          {/* Emission Reduction Rate Card */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Annual Reduction</p>
                  <div className="flex items-baseline space-x-2">
                    <p className="text-2xl font-bold">
                      {Math.abs(emissionsStats.netReductionRate).toFixed(1)}%
                    </p>
                    <span className={`text-sm ${emissionsStats.netReductionRate > 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {emissionsStats.netReductionRate > 0 ? '↓' : '↑'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">year-over-year change</p>
                </div>
                <TrendingDown className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          {/* Peak Emissions Year Card */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Peak Emissions Year</p>
                  <p className="text-2xl font-bold">
                    {formatNumber(emissionsStats.peakEmissionsYear.amount)} kg
                  </p>
                  <p className="text-xs text-gray-400 mt-1">highest in {emissionsStats.peakEmissionsYear.year}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}