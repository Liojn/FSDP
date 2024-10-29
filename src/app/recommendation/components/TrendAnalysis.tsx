import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendAnalysisProps, CategoryType } from "@/types/";

const TrendAnalysis: React.FC<TrendAnalysisProps> = ({ data, category }) => {
  const renderTrendInsights = () => {
    switch (category) {
      case CategoryType.EQUIPMENT:
        return (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">Energy Efficiency Trends</h3>
              <div className="mt-2 space-y-2">
                <div className="flex justify-between items-center">
                  <span>Energy Consumption Trend:</span>
                  <span
                    className={
                      data.energy.previousYearComparison < 0
                        ? "text-green-500"
                        : "text-red-500"
                    }
                  >
                    {data.energy.previousYearComparison < 0
                      ? "Improving"
                      : "Declining"}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  {data.energy.previousYearComparison < 0
                    ? "Energy efficiency is improving compared to last year"
                    : "Energy consumption has increased compared to last year"}
                </div>
              </div>
            </div>
          </div>
        );

      case CategoryType.LIVESTOCK:
        return (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">Livestock Impact Analysis</h3>
              <div className="mt-2 space-y-2">
                <div className="flex justify-between items-center">
                  <span>Emissions per Animal:</span>
                  <span>
                    {(data.livestock.emissions / data.livestock.count).toFixed(
                      2
                    )}{" "}
                    tons CO2e
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  Analysis shows the environmental impact per livestock unit
                </div>
              </div>
            </div>
          </div>
        );

      case CategoryType.CROPS:
        return (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">Crop Efficiency Metrics</h3>
              <div className="mt-2 space-y-2">
                <div className="flex justify-between items-center">
                  <span>Fertilizer per Hectare:</span>
                  <span>
                    {(data.crops.fertilizer / data.crops.area).toFixed(2)}{" "}
                    tons/ha
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  Shows fertilizer usage efficiency across crop area
                </div>
              </div>
            </div>
          </div>
        );

      case CategoryType.WASTE:
        return (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">Waste Distribution Analysis</h3>
              <div className="mt-2 space-y-2">
                <div>
                  <h4 className="text-sm font-medium">Waste Composition:</h4>
                  {Object.entries(data.waste.byType).map(([type, amount]) => {
                    const percentage = (
                      ((amount as number) / data.waste.quantity) *
                      100
                    ).toFixed(1);
                    return (
                      <div key={type} className="flex justify-between text-sm">
                        <span>{type}:</span>
                        <span>{percentage}% of total waste</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        );

      case CategoryType.OVERALL:
        return (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">Cross-Category Analysis</h3>
              <div className="mt-2 space-y-2">
                <div className="flex justify-between items-center">
                  <span>Energy-Emissions Ratio:</span>
                  <span>
                    {(data.emissions.total / data.energy.consumption).toFixed(
                      3
                    )}{" "}
                    tons/kWh
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Livestock-Emissions Impact:</span>
                  <span>
                    {(
                      (data.livestock.emissions / data.emissions.total) *
                      100
                    ).toFixed(1)}
                    %
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trend Analysis</CardTitle>
      </CardHeader>
      <CardContent>{renderTrendInsights()}</CardContent>
    </Card>
  );
};

export default TrendAnalysis;
