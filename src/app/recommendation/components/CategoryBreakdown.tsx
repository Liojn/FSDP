import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CategoryBreakdownProps, CategoryType } from "@/types/";

const CategoryBreakdown: React.FC<CategoryBreakdownProps> = ({
  data,
  category,
}) => {
  const renderContent = () => {
    switch (category) {
      case CategoryType.EQUIPMENT:
        return (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">Energy Consumption</h3>
              <div className="flex justify-between items-center">
                <span>Current: {data.energy.consumption} kWh</span>
                <span>YoY Change: {data.energy.previousYearComparison}%</span>
              </div>
            </div>
          </div>
        );

      case CategoryType.LIVESTOCK:
        return (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">Livestock Overview</h3>
              <div className="flex justify-between items-center">
                <span>Total Count: {data.livestock.count}</span>
                <span>Emissions: {data.livestock.emissions} tons CO2e</span>
              </div>
            </div>
          </div>
        );

      case CategoryType.CROPS:
        return (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">Crop Management</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Total Area:</span>
                  <span>{data.crops.area} hectares</span>
                </div>
                <div className="flex justify-between">
                  <span>Fertilizer Usage:</span>
                  <span>{data.crops.fertilizer} tons</span>
                </div>
              </div>
            </div>
          </div>
        );

      case CategoryType.WASTE:
        return (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">Waste Management</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Total Quantity:</span>
                  <span>{data.waste.quantity} tons</span>
                </div>
                <div className="mt-2">
                  <h4 className="text-sm font-medium">By Type:</h4>
                  {Object.entries(data.waste.byType).map(([type, amount]) => (
                    <div key={type} className="flex justify-between text-sm">
                      <span>{type}:</span>
                      <span>{amount} tons</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case CategoryType.OVERALL:
        return (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">Overall Metrics</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="block text-sm">Energy Usage</span>
                  <span className="text-lg font-medium">
                    {data.energy.consumption} kWh
                  </span>
                </div>
                <div>
                  <span className="block text-sm">Total Emissions</span>
                  <span className="text-lg font-medium">
                    {data.emissions.total} tons CO2e
                  </span>
                </div>
                <div>
                  <span className="block text-sm">Livestock Count</span>
                  <span className="text-lg font-medium">
                    {data.livestock.count}
                  </span>
                </div>
                <div>
                  <span className="block text-sm">Crop Area</span>
                  <span className="text-lg font-medium">
                    {data.crops.area} hectares
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
        <CardTitle>
          {category.charAt(0).toUpperCase() + category.slice(1)} Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent>{renderContent()}</CardContent>
    </Card>
  );
};

export default CategoryBreakdown;
