"use client";

import { Card } from "@/components/ui/card";
import type { ProgressData } from "@/types/strategic";

interface PlannerChartsProps {
  data: ProgressData;
}

export function PlannerCharts({ data }: PlannerChartsProps) {
  return (
    <div className="space-y-6">
      <Card className="p-4">
        <h3 className="text-lg font-medium mb-4">Milestone Progress</h3>
        <div className="space-y-4">
          {data.milestones.map((milestone) => (
            <div key={milestone.id} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">{milestone.title}</span>
                <span className="text-sm text-gray-500">{milestone.progress}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all duration-300"
                  style={{ width: `${milestone.progress}%` }}
                />
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>{milestone.status}</span>
                <span>Due: {new Date(milestone.dueDate).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="text-lg font-medium mb-4">Key Metrics</h3>
        <div className="space-y-4">
          {data.metrics.map((metric) => (
            <div key={metric.id} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">{metric.name}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">
                    {metric.value} {metric.unit}
                  </span>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      metric.trend === "increasing"
                        ? "bg-green-100 text-green-800"
                        : metric.trend === "decreasing"
                        ? "bg-red-100 text-red-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {metric.trend}
                  </span>
                </div>
              </div>
              <div className="h-2 bg-gray-100 rounded-full">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all duration-300"
                  style={{ width: `${(metric.value / metric.target) * 100}%` }}
                />
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>Current: {metric.value}</span>
                <span>Target: {metric.target}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
