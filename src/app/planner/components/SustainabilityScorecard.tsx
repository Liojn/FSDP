"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface KPI {
  name: string;
  current: number;
  target: number;
  unit: string;
  progress: number;
  trend: "up" | "down";
  description: string;
}

// Rest of the interfaces remain the same...
interface Goal {
  title: string;
  description: string;
  target: number;
  current: number;
  dueDate: string;
  status: "not-started" | "in-progress" | "completed";
  assignee: string;
  progress: number;
}

interface Recommendation {
  title: string;
  description: string;
  impact: string;
  difficulty: "Easy" | "Medium" | "Hard";
  roi: string;
  priority: "High" | "Medium" | "Low";
  status: "new" | "accepted" | "deferred" | "dismissed";
}

const SustainabilityScorecard = () => {
  // Data arrays remain the same...
  const kpis: KPI[] = [
    {
      name: "Energy Efficiency",
      current: 75,
      target: 100,
      unit: "kWh/unit",
      progress: 75,
      trend: "up",
      description: "Overall energy efficiency across operations",
    },
    {
      name: "Waste Reduction",
      current: 60,
      target: 80,
      unit: "kg/month",
      progress: 75,
      trend: "down",
      description: "Total waste generated per month",
    },
    {
      name: "Emissions Intensity",
      current: 45,
      target: 50,
      unit: "CO2e/unit",
      progress: 90,
      trend: "down",
      description: "Carbon emissions per unit of production",
    },
  ];

  const goals: Goal[] = [
    {
      title: "Solar Panel Installation",
      description: "Install solar panels to reduce energy consumption",
      target: 100,
      current: 60,
      dueDate: "2024-12-31",
      status: "in-progress",
      assignee: "Energy Team",
      progress: 60,
    },
    {
      title: "Zero Waste Program",
      description: "Implement comprehensive recycling system",
      target: 100,
      current: 30,
      dueDate: "2024-09-30",
      status: "not-started",
      assignee: "Facilities Team",
      progress: 30,
    },
  ];

  const recommendations: Recommendation[] = [
    {
      title: "Energy Efficiency Upgrade",
      description: "Upgrade to LED lighting across all facilities",
      impact: "Reduce energy consumption by 15%",
      difficulty: "Easy",
      roi: "24 months",
      priority: "High",
      status: "new",
    },
    {
      title: "Waste Reduction Program",
      description: "Implement recycling program in all departments",
      impact: "Reduce waste by 30%",
      difficulty: "Medium",
      roi: "14 months",
      priority: "Medium",
      status: "accepted",
    },
  ];

  return (
    <div className="w-full space-y-4">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analysis">Data Analysis</TabsTrigger>
          <TabsTrigger value="planning">Strategic Planning</TabsTrigger>
          <TabsTrigger value="benchmarks">Benchmarking</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        {/* Rest of the JSX remains exactly the same... */}
        <TabsContent value="overview">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Performance Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {kpis.map((kpi, index) => (
                <div key={index} className="bg-white p-4 rounded-lg shadow">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium text-gray-900">{kpi.name}</h4>
                      <p className="text-sm text-gray-500">{kpi.description}</p>
                    </div>
                    <span
                      className={`text-sm ${
                        kpi.trend === "up" ? "text-green-500" : "text-red-500"
                      }`}
                    >
                      {kpi.trend === "up" ? "↑" : "↓"}
                    </span>
                  </div>
                  <div className="mt-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span>
                        {kpi.current} {kpi.unit}
                      </span>
                      <span className="text-gray-500">
                        Target: {kpi.target} {kpi.unit}
                      </span>
                    </div>
                    <Progress value={kpi.progress} className="h-2" />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="analysis">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Data Analysis</h3>
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Historical Trends</h4>
                <div className="h-64 bg-white rounded-lg border p-4">
                  {/* Placeholder for charts */}
                  <p className="text-gray-500">
                    Time-series charts will be displayed here
                  </p>
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Comparative Analysis</h4>
                <div className="h-64 bg-white rounded-lg border p-4">
                  {/* Placeholder for comparison charts */}
                  <p className="text-gray-500">
                    Comparison charts will be displayed here
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
        <TabsContent value="planning">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Strategic Planning</h3>
            <div className="space-y-6">
              {goals.map((goal, index) => (
                <div key={index} className="bg-white p-4 rounded-lg shadow">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium">{goal.title}</h4>
                      <p className="text-sm text-gray-500">
                        {goal.description}
                      </p>
                    </div>
                    <span
                      className={`text-sm px-2 py-1 rounded-full ${
                        goal.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : goal.status === "in-progress"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {goal.status}
                    </span>
                  </div>
                  <div className="mt-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progress: {goal.current}%</span>
                      <span>Due: {goal.dueDate}</span>
                    </div>
                    <Progress value={goal.progress} className="h-2" />
                  </div>
                  <div className="mt-2 text-sm text-gray-500">
                    Assigned to: {goal.assignee}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="benchmarks">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Benchmarking</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Department Comparison</h4>
                <div className="space-y-4">
                  {kpis.map((kpi, index) => (
                    <div key={index} className="bg-white p-3 rounded shadow">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">{kpi.name}</span>
                        <span className="text-sm text-gray-500">
                          Your rank: 2/5
                        </span>
                      </div>
                      <Progress value={75} className="h-2" />
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Industry Benchmarks</h4>
                <div className="space-y-4">
                  {kpis.map((kpi, index) => (
                    <div key={index} className="bg-white p-3 rounded shadow">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">{kpi.name}</span>
                        <span className="text-sm text-gray-500">
                          Industry avg: {kpi.target} {kpi.unit}
                        </span>
                      </div>
                      <Progress value={85} className="h-2" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="insights">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">
              Insights and Recommendations
            </h3>
            <div className="space-y-4">
              {recommendations.map((rec, index) => (
                <div key={index} className="bg-white p-4 rounded-lg shadow">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{rec.title}</h4>
                      <p className="text-sm text-gray-500 mt-1">
                        {rec.description}
                      </p>
                    </div>
                    <span
                      className={`text-sm px-2 py-1 rounded-full ${
                        rec.priority === "High"
                          ? "bg-red-100 text-red-800"
                          : rec.priority === "Medium"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {rec.priority} Priority
                    </span>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Impact:</span>
                      <p>{rec.impact}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Difficulty:</span>
                      <p>{rec.difficulty}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">ROI:</span>
                      <p>{rec.roi}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex justify-end space-x-2">
                    <button className="px-3 py-1 text-sm bg-green-50 text-green-700 rounded hover:bg-green-100">
                      Accept
                    </button>
                    <button className="px-3 py-1 text-sm bg-gray-50 text-gray-700 rounded hover:bg-gray-100">
                      Defer
                    </button>
                    <button className="px-3 py-1 text-sm bg-red-50 text-red-700 rounded hover:bg-red-100">
                      Dismiss
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SustainabilityScorecard;
