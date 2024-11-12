"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MetricData } from "@/types";

interface ScopeEmissionsBreakdownProps {
  data: MetricData;
  scope: "Scope 1" | "Scope 2" | "Scope 3";
}

const scopeDescriptions = {
  "Scope 1":
    "Direct emissions from owned or controlled sources (e.g., vehicle fleet, on-site energy production)",
  "Scope 2":
    "Indirect emissions from purchased electricity, steam, heating, and cooling",
  "Scope 3":
    "All other indirect emissions in the value chain (e.g., supplier activities, transportation, waste)",
};

const ScopeEmissionsBreakdown: React.FC<ScopeEmissionsBreakdownProps> = ({
  data,
  scope,
}) => {
  // Placeholder logic for scope-specific emissions
  const totalEmissions = data.emissions.total;

  // Placeholder for scope-specific emissions - you'll need to implement actual logic
  const scopeEmissions = data.emissions.byCategory[scope] || 0;

  const percentageOfTotal =
    totalEmissions > 0 ? (scopeEmissions / totalEmissions) * 100 : 0;

  const thresholdValue = 1000; // Replace with actual threshold from user settings

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{scope} Emissions Breakdown</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger className="w-full">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium">{scope} Emissions:</span>
                <Progress value={percentageOfTotal} className="flex-grow" />
                <span className="text-sm font-semibold">
                  {scopeEmissions.toLocaleString()} kg CO₂e
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{scopeDescriptions[scope]}</p>
              <p className="mt-2">
                {percentageOfTotal.toFixed(2)}% of total emissions
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Current Emissions</span>
            <span>{scopeEmissions.toLocaleString()} kg CO₂e</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Threshold</span>
            <span>{thresholdValue.toLocaleString()} kg CO₂e</span>
          </div>
          <div className="flex justify-between text-sm font-semibold">
            <span>Status</span>
            <span
              className={
                scopeEmissions > thresholdValue
                  ? "text-red-600"
                  : "text-green-600"
              }
            >
              {scopeEmissions > thresholdValue ? "Exceeded" : "Within Limit"}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ScopeEmissionsBreakdown;
