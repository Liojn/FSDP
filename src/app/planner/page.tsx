"use client";

import { useEffect, useState } from "react";
import { StrategicGoalManager } from "./components/StrategicGoalManager";
import { PlannerCharts } from "./components/PlannerCharts";
import { SustainabilityScorecard } from "./components/SustainabilityScorecard";
import { strategicDataService } from "@/lib/services/strategicDataService";
import type { 
  ProgressData, 
  DepartmentBenchmark,
  RoadmapData
} from "@/types/strategic";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PlannerPage() {
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [benchmarks, setBenchmarks] = useState<DepartmentBenchmark | null>(null);
  const [roadmap, setRoadmap] = useState<RoadmapData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [progressData, benchmarkData, roadmapData] = await Promise.all([
          strategicDataService.getProgress(),
          strategicDataService.getDepartmentBenchmarks("operations"),
          strategicDataService.getRoadmapData()
        ]);

        setProgress(progressData);
        setBenchmarks(benchmarkData);
        setRoadmap(roadmapData);
      } catch (error) {
        console.error("Error fetching planner data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Strategic Sustainability Planner</h1>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="goals">Goals & Progress</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="roadmap">Strategic Roadmap</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Progress Overview</CardTitle>
              </CardHeader>
              <CardContent>
                {progress && <PlannerCharts data={progress} />}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Department Performance</CardTitle>
              </CardHeader>
              <CardContent>
                {benchmarks && <SustainabilityScorecard data={benchmarks} />}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="goals" className="space-y-6">
          <StrategicGoalManager />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Metrics Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                {progress && (
                  <div className="space-y-4">
                    {progress.metrics.map((metric) => (
                      <div key={metric.id} className="space-y-2">
                        <div className="flex justify-between">
                          <span className="font-medium">{metric.name}</span>
                          <span className="text-gray-500">
                            {metric.value} {metric.unit}
                          </span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full">
                          <div
                            className="h-full bg-blue-600 rounded-full"
                            style={{
                              width: `${(metric.value / metric.target) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Benchmark Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                {benchmarks && (
                  <div className="space-y-4">
                    <div className="text-sm text-gray-500">
                      Industry Average: {benchmarks.industryAverage}
                    </div>
                    <div className="text-sm text-gray-500">
                      Top Performer: {benchmarks.topPerformer}
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">Recommendations</h4>
                      <ul className="list-disc pl-5 space-y-1">
                        {benchmarks.recommendations.map((rec, index) => (
                          <li key={index} className="text-sm">
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="roadmap" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Strategic Roadmap</CardTitle>
            </CardHeader>
            <CardContent>
              {roadmap && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    {roadmap.milestones.map((milestone) => (
                      <div
                        key={milestone.id}
                        className="border p-4 rounded-lg space-y-2"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{milestone.title}</h4>
                            <p className="text-sm text-gray-500">
                              {milestone.description}
                            </p>
                          </div>
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              milestone.status === "completed"
                                ? "bg-green-100 text-green-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {milestone.status}
                          </span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>Progress</span>
                            <span>{milestone.progress}%</span>
                          </div>
                          <div className="h-2 bg-gray-200 rounded-full">
                            <div
                              className="h-full bg-blue-600 rounded-full"
                              style={{ width: `${milestone.progress}%` }}
                            />
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">
                          Due: {new Date(milestone.dueDate).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
