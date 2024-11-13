/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect, useRef } from "react";
import EmissionsChart from "./predictionComponents/predictionGraph";
import { PageHeader } from "@/components/shared/page-header";
import NetZeroGraph from "./netZeroGraph/netZeroGraph";

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

export default function PredictionPage() {
  const netZeroGraphRef = useRef<HTMLDivElement>(null);
  const emissionsChartRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<PredictionResponse | null>(null);
  const [, setEmissionsStats] = useState<EmissionsStats | null>(null);
  const [userGoals] = useState<UserGoals>({
    annualEmissionsTarget: 10000,
    targetYear: 2030,
    percentageReduction: 50,
  });

  const prepareYearlyData = (data: MonthlyData): EmissionsStats => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);
    const ytdMonths = Math.floor(
      (currentDate.getTime() - startOfYear.getTime()) /
        (1000 * 60 * 60 * 24 * 30)
    );

    // Find peak emissions year
    const yearlyEmissions = [];
    for (let i = 0; i < data.netMonthlyEmissions.length; i += 12) {
      const yearSlice = data.netMonthlyEmissions.slice(i, i + 12);
      if (yearSlice.length === 0) break;

      const year =
        currentYear -
        (Math.floor(data.netMonthlyEmissions.length / 12) -
          Math.floor(i / 12) -
          1);
      const totalEmissions = yearSlice.reduce(
        (sum, val) => sum + (val || 0),
        0
      );
      yearlyEmissions.push({ year, amount: totalEmissions });
    }

    const peakEmissionsYear = yearlyEmissions.reduce((max, current) => {
      return current.amount > max.amount ? current : max;
    });

    // Calculate other statistics
    const ytdNetEmissions = data.netMonthlyEmissions
      .slice(-ytdMonths)
      .reduce((a, b) => a + b, 0);
    const cumulativeEmissions = data.netMonthlyEmissions.reduce(
      (a, b) => a + b,
      0
    );

    const last12Months = {
      equipment: data.equipment.slice(-12).reduce((a, b) => a + b, 0),
      livestock: data.livestock.slice(-12).reduce((a, b) => a + b, 0),
      crops: data.crops.slice(-12).reduce((a, b) => a + b, 0),
      waste: data.waste.slice(-12).reduce((a, b) => a + b, 0),
    };

    const monthlyAverages = {
      emissions:
        data.totalMonthlyEmissions.slice(-6).reduce((a, b) => a + b, 0) / 6,
      absorption:
        data.totalMonthlyAbsorption.slice(-6).reduce((a, b) => a + b, 0) / 6,
      net: data.netMonthlyEmissions.slice(-6).reduce((a, b) => a + b, 0) / 6,
    };

    const thisYearNet = data.netMonthlyEmissions
      .slice(-12)
      .reduce((a, b) => a + b, 0);
    const lastYearNet = data.netMonthlyEmissions
      .slice(-24, -12)
      .reduce((a, b) => a + b, 0);
    const netReductionRate =
      ((lastYearNet - thisYearNet) / Math.abs(lastYearNet)) * 100;

    const last3MonthsAvg =
      data.netMonthlyEmissions.slice(-3).reduce((a, b) => a + b, 0) / 3;
    const previous3MonthsAvg =
      data.netMonthlyEmissions.slice(-6, -3).reduce((a, b) => a + b, 0) / 3;

    return {
      netReductionRate,
      peakEmissionsYear,
      totalNetEmissionsYTD: ytdNetEmissions,
      cumulativeEmissions,
      emissionsBySource: last12Months,
      monthlyAverages,
      trends: {
        isIncreasing: last3MonthsAvg > previous3MonthsAvg,
        monthsToTarget: Math.ceil(
          (monthlyAverages.net - userGoals.annualEmissionsTarget) /
            (monthlyAverages.net * 0.05)
        ),
        percentageToTarget:
          ((userGoals.annualEmissionsTarget - monthlyAverages.net) /
            userGoals.annualEmissionsTarget) *
          100,
      },
    };
  };

  useEffect(() => {
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

        const stats = prepareYearlyData(combinedData);
        setEmissionsStats(stats);
        setData({ monthlyData: combinedData });
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistoricalData();
  }, []);

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="pt-0 flex justify-between items-center mb-4">
        <PageHeader title="NET ZERO Prediction" />
      </div>
      <div className="" ref={netZeroGraphRef}>
        <NetZeroGraph data={data?.monthlyData} isLoading={isLoading} />
      </div>
      <div className="" ref={emissionsChartRef}>
        <EmissionsChart data={data?.monthlyData} isLoading={isLoading} />
      </div>
    </div>
  );
}
function setError(_arg0: string) {
  throw new Error("Function not implemented.");
}
