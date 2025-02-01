"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";

interface MetricCardProps {
  title: React.ReactNode; // Change from string to ReactNode;
  value: number | string;
  unit: string;
  className?: string;
  icon?: React.ReactNode; // Icon to display on the right
}

export function MetricCard({
  title,
  value,
  unit,
  className = "",
  icon,
}: MetricCardProps) {
  return (
    <Card className={`w-full min-h-[200px] flex flex-col justify-between ${className} shadow`}>
      <CardContent className="pt-6 flex-grow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 min-h-[40px] flex items-center">
              {title}
            </p>
            <p className="text-4xl font-bold">
              {typeof value === "number"
                ? value.toLocaleString(undefined)
                : value}{" "}
            </p>
            {unit && (
              <p className="text-sm text-gray-400 mt-1">{unit}</p>
            )}
          </div>
          {icon && <span className="w-8 h-8">{icon}</span>}
        </div>
      </CardContent>
    </Card>
  );
}


export default MetricCard;
