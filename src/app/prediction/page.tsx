// pages/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import PredictionGraph from "./predictionComponents/predictionGraph";
import { PageHeader } from "@/components/shared/page-header";
import { Loader2 } from "lucide-react";

const Page: React.FC = () => {
  const [yearlyData, setYearlyData] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Set an example emission goal (can be dynamic if needed)
  const emissionGoal = 10000; // Adjust this annual goal as needed

  // Helper function to calculate sustainability metrics for each year
  const calculateSustainabilityMetrics = (
    yearData: { netMonthlyEmissions: number[] },
    annualGoal: number
  ) => {
    const totalNetEmissions = yearData.netMonthlyEmissions.reduce(
      (a, b) => a + b,
      0
    );
    const differenceFromGoal =
      100 - ((annualGoal - totalNetEmissions) / annualGoal) * 100;

    // Calculate when net zero will be reached within the year
    let cumulativeEmissions = 0;
    let monthReached = -1;
    for (let i = 0; i < yearData.netMonthlyEmissions.length; i++) {
      cumulativeEmissions += yearData.netMonthlyEmissions[i];
      if (cumulativeEmissions <= 0) {
        monthReached = i;
        break;
      }
    }

    const startYear = new Date().getFullYear();
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    let netZeroDate = "N/A";

    if (monthReached !== -1) {
      const month = monthNames[monthReached % 12];
      const year = startYear;
      netZeroDate = `${month} ${year}`;
    } else {
      const avgMonthlyReduction =
        yearData.netMonthlyEmissions.reduce((a, b) => a + b, 0) /
        yearData.netMonthlyEmissions.length;
      if (avgMonthlyReduction < 0) {
        const monthsToNetZero = Math.ceil(
          cumulativeEmissions / Math.abs(avgMonthlyReduction)
        );
        const futureMonth =
          (yearData.netMonthlyEmissions.length + monthsToNetZero) % 12;
        const futureYear =
          startYear +
          Math.floor(
            (yearData.netMonthlyEmissions.length + monthsToNetZero) / 12
          );
        netZeroDate = `${monthNames[futureMonth]} ${futureYear}`;
      }
    }

    return {
      emissionReductionGoal: `maximum ${annualGoal} kg CO₂/year`,
      actualTotalNetEmissions: totalNetEmissions,
      differenceFromGoal: differenceFromGoal.toFixed(1), // rounded to 1 decimal place
      netZeroDate,
    };
  };

  // Helper function to check if all data in monthlyData is zero
  const isDataZero = (data: any) => {
    return (
      data.equipment.every((val: number) => val === 0) &&
      data.livestock.every((val: number) => val === 0) &&
      data.crops.every((val: number) => val === 0) &&
      data.waste.every((val: number) => val === 0) &&
      data.totalMonthlyEmissions.every((val: number) => val === 0) &&
      data.totalMonthlyAbsorption.every((val: number) => val === 0) &&
      data.netMonthlyEmissions.every((val: number) => val === 0)
    );
  };

  // Fetch data for multiple years
  useEffect(() => {
    const fetchYearlyData = async () => {
      const currentYear = new Date().getFullYear();
      let dataCollection: any[] = [];
      let fetchComplete = false;

      for (let i = 0; i < 10; i++) {
        const year = currentYear - i;
        const response = await fetch("/api/prediction", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            userName: localStorage.getItem("userName") || "userName",
          },
          body: JSON.stringify({ endYear: year, dataType: "carbon-emissions" }),
        });

        const data = await response.json();

        if (data.monthlyData && isDataZero(data.monthlyData)) {
          fetchComplete = true;
          break;
        }

        // Calculate and set metrics for each year
        const calculatedMetrics = calculateSustainabilityMetrics(
          data.monthlyData,
          emissionGoal
        );
        setMetrics(calculatedMetrics);

        // Add the data for this year to the collection
        dataCollection.push({ year, ...data.monthlyData });
      }

      setYearlyData(dataCollection);
      setLoading(false);
    };

    fetchYearlyData();
  }, []);

  return (
    <div className="min-h-screen w-full">
      <PageHeader title="Net Zero Predictions" />

      {loading ? (
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-lime-600" />
        </div>
      ) : (
        <div className="flex flex-col gap-6 bg-white p-6 rounded-lg shadow-lg w-full mx-auto">
          {/* Graph Section */}
          <div className="w-[70%]">
            <PredictionGraph yearlyData={yearlyData} />
          </div>

          {/* Emission Goal Display */}
          <div className="w-full text-center md:text-left">
            <h2 className="text-2xl font-semibold text-gray-800">
              Emission Goal
            </h2>
            <p className="text-gray-600 text-xl">Our goal for the year:</p>
            <p className="text-xl font-bold text-green-600">
              {emissionGoal} kg CO₂
            </p>
          </div>

          {/* Metrics Display Below the Graph and Goal */}
          {metrics && (
            <div className="w-full mt-4">
              <h2 className="text-xl font-semibold text-gray-800">
                Sustainability Performance
              </h2>
              <p className="text-xl mt-2">
                <strong>Emission Reduction Goal:</strong>{" "}
                {metrics.emissionReductionGoal}
              </p>
              <p>
                <strong>Actual Total Net Emissions:</strong>{" "}
                {metrics.actualTotalNetEmissions} kg CO₂ (
                {metrics.differenceFromGoal}% to limit)
              </p>
              <p>
                <strong>Estimated Net Zero Emission Date:</strong>{" "}
                {metrics.netZeroDate}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Page;
