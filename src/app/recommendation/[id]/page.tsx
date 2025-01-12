"use client";

import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, CheckCircle2, Clock, Leaf } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";

const initialRecommendations = [
  {
    id: "678390cc23d7a53a58b91430",
    title: "Improve Energy Efficiency",
    description:
      "Implement energy-efficient lighting, HVAC systems, and equipment to reduce emissions.",
    scope: "Scope 2",
    impact: "Estimated 10% reduction in Scope 2 emissions",
    estimatedEmissionReduction: 1440,
    status: "Not Started",
    progress: 0,
    implementationSteps: [
      "Conduct energy audit to identify efficiency opportunities",
      "Replace old equipment with energy-efficient models",
      "Optimize HVAC settings and schedules",
    ],
    completedSteps: 0,
    notes: "",
  },
  {
    id: "678390cc23d7a53a58b91431",
    title: "Optimize Transportation and Logistics",
    description:
      "Optimize transportation routes, utilize more efficient vehicles, and implement eco-driving practices.",
    scope: "Scope 1",
    impact: "Estimated 8% reduction in Scope 1 emissions",
    estimatedEmissionReduction: 1328,
    status: "In Progress",
    progress: 50,
    implementationSteps: [
      "Review transportation routes and schedules to minimize mileage",
      "Replace older vehicles with more fuel-efficient models",
      "Provide eco-driving training for drivers",
    ],
    completedSteps: 1,
    notes: "Eco-driving training scheduled for next month.",
  },
  {
    id: "678390cc23d7a53a58b91432",
    title: "Implement Renewable Energy",
    description:
      "Install on-site solar photovoltaic (PV) systems to generate renewable energy.",
    scope: "Scope 2",
    impact: "Estimated 15% reduction in Scope 2 emissions",
    estimatedEmissionReduction: 216,
    status: "Completed",
    progress: 100,
    implementationSteps: [
      "Assess site suitability for solar PV installation",
      "Obtain necessary permits and approvals",
      "Install and commission the solar PV system",
    ],
    completedSteps: 3,
    notes: "System fully operational since last month.",
  },
];

export default function TrackingRecommendationsPage() {
  const [recommendations, setRecommendations] = useState(
    initialRecommendations
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleStepCompletion = (id: string, _stepIndex: number) => {
    setRecommendations((prev) =>
      prev.map((rec) =>
        rec.id === id
          ? {
              ...rec,
              completedSteps: rec.completedSteps + 1,
              progress:
                ((rec.completedSteps + 1) / rec.implementationSteps.length) *
                100,
              status:
                rec.completedSteps + 1 === rec.implementationSteps.length
                  ? "Completed"
                  : "In Progress",
            }
          : rec
      )
    );
  };

  const handleNotesUpdate = (id: string, notes: string) => {
    setRecommendations((prev) =>
      prev.map((rec) => (rec.id === id ? { ...rec, notes } : rec))
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Completed":
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case "In Progress":
        return <Clock className="w-4 h-4 text-yellow-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <main className="min-h-screen ">
      <div className="container mx-auto py-12 px-4">
        <PageHeader title="Tracking" />

        {/* Overview Cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-12">
          <Card className="bg-white/50 backdrop-blur border-green-100 shadow-sm">
            <CardHeader className="space-y-1">
              <CardTitle className="text-xl font-semibold text-gray-900">
                Total Initiatives
              </CardTitle>
              <CardDescription>Active sustainability programs</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-700">
                {recommendations.length}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/50 backdrop-blur border-yellow-100 shadow-sm">
            <CardHeader className="space-y-1">
              <CardTitle className="text-xl font-semibold text-gray-900">
                In Progress
              </CardTitle>
              <CardDescription>Currently implementing</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-yellow-700">
                {
                  recommendations.filter((rec) => rec.status === "In Progress")
                    .length
                }
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/50 backdrop-blur border-green-100 shadow-sm">
            <CardHeader className="space-y-1">
              <CardTitle className="text-xl font-semibold text-gray-900">
                Completed
              </CardTitle>
              <CardDescription>Successfully implemented</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-700">
                {
                  recommendations.filter((rec) => rec.status === "Completed")
                    .length
                }
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recommendations List */}
        <div className="space-y-6">
          {recommendations.map((rec) => (
            <Card
              key={rec.id}
              className="bg-white/80 backdrop-blur shadow-sm border-gray-100"
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-xl font-semibold text-gray-900">
                      {rec.title}
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                      {rec.description}
                    </CardDescription>
                  </div>
                  <Badge
                    className={`px-3 py-1 flex items-center gap-2 ${
                      rec.status === "Completed"
                        ? "bg-green-100 text-green-800"
                        : rec.status === "In Progress"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {getStatusIcon(rec.status)}
                    {rec.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Scope</p>
                    <p className="text-gray-900">{rec.scope}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Impact</p>
                    <p className="text-gray-900">{rec.impact}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-600">
                      Progress
                    </p>
                    <p className="text-sm text-gray-600">
                      {rec.completedSteps} of {rec.implementationSteps.length}{" "}
                      steps
                    </p>
                  </div>
                  <Progress value={rec.progress} className="h-2 bg-gray-100" />
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-medium text-gray-600">
                    Implementation Steps
                  </p>
                  <ul className="space-y-3">
                    {rec.implementationSteps.map((step, index) => (
                      <li key={index} className="flex items-center gap-3">
                        <Button
                          variant={
                            index < rec.completedSteps ? "secondary" : "outline"
                          }
                          size="sm"
                          disabled={index < rec.completedSteps}
                          onClick={() => handleStepCompletion(rec.id, index)}
                          className={
                            index < rec.completedSteps
                              ? "bg-green-50 text-green-700"
                              : ""
                          }
                        >
                          {index < rec.completedSteps
                            ? "Completed"
                            : "Mark Complete"}
                        </Button>
                        <span
                          className={`text-gray-700 ${
                            index < rec.completedSteps
                              ? "line-through text-gray-400"
                              : ""
                          }`}
                        >
                          {step}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600">Notes</p>
                  <Textarea
                    className="min-h-[100px] bg-white"
                    placeholder="Add implementation notes or updates..."
                    value={rec.notes}
                    onChange={(e) => handleNotesUpdate(rec.id, e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
}
