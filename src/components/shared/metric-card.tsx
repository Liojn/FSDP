"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MetricCardProps {
  title: string;
  value: number;
  unit: string;
  className?: string;
}

export function MetricCard({
  title,
  value,
  unit,
  className = "",
}: MetricCardProps) {
  return (
    <Card className={`w-full max-w-xs ${className} shadow text-center`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-md font-medium text-muted-foreground ">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col">
          <span className="text-4xl font-bold tracking-tight">
            {value.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
          <span className="text-sm text-muted-foreground uppercase mt-1">
            {unit}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

export default MetricCard;
