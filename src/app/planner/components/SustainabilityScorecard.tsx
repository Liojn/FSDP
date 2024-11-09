"use client";

import { Card } from "@/components/ui/card";
import type { DepartmentBenchmark } from "@/types/strategic";

interface SustainabilityScorecardProps {
  data: DepartmentBenchmark;
}

export function SustainabilityScorecard({ data }: SustainabilityScorecardProps) {
  const getPerformanceStatus = (value: number, target: number) => {
    const ratio = value / target;
    if (ratio >= 1) return "Excellent";
    if (ratio >= 0.8) return "Good";
    if (ratio >= 0.6) return "Fair";
    return "Needs Improvement";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Excellent":
        return "bg-green-100 text-green-800";
      case "Good":
        return "bg-blue-100 text-blue-800";
      case "Fair":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-red-100 text-red-800";
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <h3 className="text-lg font-medium mb-4">Department Performance</h3>
        <div className="space-y-4">
          {data.metrics.map((metric) => {
            const status = getPerformanceStatus(metric.value, metric.target);
            return (
              <div key={metric.id} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{metric.name}</span>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${getStatusColor(
                      status
                    )}`}
                  >
                    {status}
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all duration-300"
                    style={{ width: `${(metric.value / metric.target) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Current: {metric.value} {metric.unit}</span>
                  <span>Target: {metric.target} {metric.unit}</span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="text-lg font-medium mb-4">Industry Comparison</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
            <span>Industry Average</span>
            <span className="font-medium">{data.industryAverage}</span>
          </div>
          <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
            <span>Top Performer</span>
            <span className="font-medium">{data.topPerformer}</span>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="text-lg font-medium mb-4">Recommendations</h3>
        <ul className="space-y-2">
          {data.recommendations.map((recommendation, index) => (
            <li
              key={index}
              className="flex items-start space-x-2 text-sm text-gray-600"
            >
              <span className="mt-1 block h-1.5 w-1.5 rounded-full bg-blue-600" />
              <span>{recommendation}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
