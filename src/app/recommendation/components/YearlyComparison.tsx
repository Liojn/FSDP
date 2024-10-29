import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { YearlyComparisonProps } from "@/types/";

const YearlyComparison: React.FC<YearlyComparisonProps> = ({ data }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Year-over-Year Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Energy Comparison */}
          <div>
            <h3 className="font-semibold">Energy Usage</h3>
            <div className="flex justify-between items-center">
              <span>Current Consumption: {data.energy.consumption} kWh</span>
              <span
                className={
                  data.energy.previousYearComparison < 0
                    ? "text-green-500"
                    : "text-red-500"
                }
              >
                {data.energy.previousYearComparison}% vs Last Year
              </span>
            </div>
          </div>

          {/* Emissions Comparison */}
          <div>
            <h3 className="font-semibold">Emissions</h3>
            <div>
              <span>Total: {data.emissions.total} tons CO2e</span>
              <div className="mt-2">
                <h4 className="text-sm font-medium">By Category:</h4>
                {Object.entries(data.emissions.byCategory).map(
                  ([category, value]) => (
                    <div
                      key={category}
                      className="flex justify-between text-sm"
                    >
                      <span>{category}:</span>
                      <span>{value} tons CO2e</span>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>

          {/* Livestock Data */}
          <div>
            <h3 className="font-semibold">Livestock</h3>
            <div className="flex justify-between items-center">
              <span>Total Count: {data.livestock.count}</span>
              <span>Emissions: {data.livestock.emissions} tons CO2e</span>
            </div>
          </div>

          {/* Crops Data */}
          <div>
            <h3 className="font-semibold">Crops</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Area:</span>
                <span>{data.crops.area} hectares</span>
              </div>
              <div className="flex justify-between">
                <span>Fertilizer Usage:</span>
                <span>{data.crops.fertilizer} tons</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default YearlyComparison;
