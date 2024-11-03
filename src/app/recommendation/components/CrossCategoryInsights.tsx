import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CrossCategoryInsightsProps } from "@/types/";

const CrossCategoryInsights: React.FC<CrossCategoryInsightsProps> = ({
  data,
}) => {
  // Calculate key relationships and metrics
  const energyPerArea = (data.energy.consumption / data.crops.area).toFixed(2);
  const emissionsPerLivestock = (
    data.livestock.emissions / data.livestock.count
  ).toFixed(2);
  const wastePerArea = (data.waste.quantity / data.crops.area).toFixed(2);
  const fertilizerEfficiency = (
    data.crops.fertilizer / data.crops.area
  ).toFixed(3);

  // Calculate the distribution of emissions
  const totalEmissions = data.emissions.total;
  const emissionsDistribution = Object.entries(data.emissions.byCategory).map(
    ([category, amount]) => ({
      category,
      percentage: (((amount as number) / totalEmissions) * 100).toFixed(1),
    })
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cross-Category Insights</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Resource Efficiency Metrics */}
          <div>
            <h3 className="font-semibold mb-2">Resource Efficiency</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="block text-sm text-gray-600">
                  Energy per Hectare
                </span>
                <span className="text-lg font-medium">
                  {energyPerArea} kWh/ha
                </span>
              </div>
              <div>
                <span className="block text-sm text-gray-600">
                  Waste per Hectare
                </span>
                <span className="text-lg font-medium">
                  {wastePerArea} tons/ha
                </span>
              </div>
            </div>
          </div>

          {/* Environmental Impact */}
          <div>
            <h3 className="font-semibold mb-2">Environmental Impact</h3>
            <div className="space-y-2">
              <div>
                <span className="block text-sm text-gray-600">
                  Emissions per Livestock
                </span>
                <span className="text-lg font-medium">
                  {emissionsPerLivestock} tons CO2e/animal
                </span>
              </div>
              <div>
                <span className="block text-sm text-gray-600">
                  Fertilizer Efficiency
                </span>
                <span className="text-lg font-medium">
                  {fertilizerEfficiency} tons/ha
                </span>
              </div>
            </div>
          </div>

          {/* Emissions Distribution */}
          <div>
            <h3 className="font-semibold mb-2">Emissions Distribution</h3>
            <div className="space-y-1">
              {emissionsDistribution.map(({ category, percentage }) => (
                <div
                  key={category}
                  className="flex justify-between items-center"
                >
                  <span className="text-sm capitalize">{category}</span>
                  <span className="text-sm font-medium">{percentage}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Key Insights */}
          <div>
            <h3 className="font-semibold mb-2">Key Insights</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                • Livestock contributes{" "}
                {(
                  (data.livestock.emissions / data.emissions.total) *
                  100
                ).toFixed(1)}
                % of total emissions
              </li>
              <li>
                • Energy consumption is{" "}
                {data.energy.previousYearComparison < 0 ? "down" : "up"}{" "}
                {Math.abs(data.energy.previousYearComparison)}% compared to last
                year
              </li>
              <li>
                • Average waste production is {wastePerArea} tons per hectare of
                farmland
              </li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CrossCategoryInsights;
