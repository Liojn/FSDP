"use client";
import { PageHeader } from "@/components/shared/page-header";
import { useData, MonthlyData } from "@/context/DataContext";
import { useRef, useEffect } from "react";
import NetZeroGraph from "./netZeroGraph/netZeroGraph";
import EmissionsChart from "./carbonNeutralGraph/predictionGraph";


export default function PredictionPage() {
  const netZeroGraphRef = useRef<HTMLDivElement>(null);
  const emissionsChartRef = useRef<HTMLDivElement>(null);
  const { setData, setIsLoading, setError} = useData();

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

        setData(combinedData); // Use setData from context
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setIsLoading(false); // Use setIsLoading from context
      }
    };

    fetchHistoricalData();
  }, [setData, setError, setIsLoading]);

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="pt-0 flex justify-between items-center mb-4">
        <PageHeader title="Prediction" />
      </div>
      <div className="" ref={netZeroGraphRef}>
        <NetZeroGraph/>
      </div>
      <div className="" ref={emissionsChartRef}>
        <EmissionsChart />
      </div>
    </div>
  );
}
