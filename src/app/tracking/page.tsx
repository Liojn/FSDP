"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ChevronRight,
} from "lucide-react";

export type RecommendationWithTracking = {
  id: string;
  title: string;
  description: string;
  difficulty: "Easy" | "Medium" | "Hard";
  priorityLevel: "Low" | "Medium" | "High" | "Critical";
  estimatedTimeframe: string;
  impact: string;
  implementationSteps: string[];
  estimatedEmissionReduction: number;
  estimatedCost: number;
  relatedMetrics: string[];
  tracking: {
    startDate: string;
    lastUpdated: string;
    status: "Not Started" | "In Progress" | "Completed" | "On Hold";
    progressPercentage: number;
    notes: string[];
    metrics: Array<{
      name: string;
      value: number;
      unit: string;
      trend?: "up" | "down" | "stable";
    }>;
  };
};

export const mockRecommendationsData: RecommendationWithTracking[] = [
  {
    id: "1",
    title: "Implement Smart Building Management System",
    description:
      "Deploy an AI-powered building management system to optimize HVAC, lighting, and energy usage based on occupancy patterns and weather conditions.",
    difficulty: "Hard",
    priorityLevel: "High",
    estimatedTimeframe: "6-8 months",
    impact:
      "Significant reduction in energy consumption and improved occupant comfort through intelligent automation.",
    implementationSteps: [
      "Conduct building energy audit",
      "Select BMS vendor and solution",
      "Install IoT sensors and controls",
      "Configure automation rules",
      "Train facility staff",
      "Monitor and optimize performance",
    ],
    estimatedEmissionReduction: 250000,
    estimatedCost: 175000,
    relatedMetrics: [
      "Energy Consumption",
      "HVAC Efficiency",
      "Occupant Comfort",
    ],
    tracking: {
      startDate: "2024-01-15",
      lastUpdated: "2024-01-11",
      status: "In Progress",
      progressPercentage: 35,
      notes: [
        "Completed initial energy audit",
        "Shortlisted three BMS vendors",
        "Received detailed proposals and pricing",
        "Technical evaluation in progress",
      ],
      metrics: [
        {
          name: "Energy Consumption",
          value: 450000,
          unit: "kWh/month",
          trend: "down",
        },
        {
          name: "HVAC Efficiency",
          value: 78,
          unit: "%",
          trend: "up",
        },
      ],
    },
  },
  {
    id: "2",
    title: "Transition to Electric Vehicle Fleet",
    description:
      "Replace current fossil fuel vehicles with electric alternatives and install charging infrastructure.",
    difficulty: "Medium",
    priorityLevel: "Critical",
    estimatedTimeframe: "12-18 months",
    impact:
      "Direct reduction in scope 1 emissions and demonstration of climate leadership.",
    implementationSteps: [
      "Analyze current fleet usage patterns",
      "Research EV models and specifications",
      "Plan charging infrastructure",
      "Pilot with initial vehicles",
      "Install charging stations",
      "Scale deployment",
      "Train drivers and maintenance staff",
    ],
    estimatedEmissionReduction: 180000,
    estimatedCost: 450000,
    relatedMetrics: ["Fleet Emissions", "Fuel Costs", "Maintenance Costs"],
    tracking: {
      startDate: "2023-11-01",
      lastUpdated: "2024-01-10",
      status: "In Progress",
      progressPercentage: 20,
      notes: [
        "Completed fleet analysis",
        "Selected Tesla Model 3 and Ford F-150 Lightning for pilot",
        "Started charging infrastructure planning",
        "Applied for EV incentives",
      ],
      metrics: [
        {
          name: "Fleet Emissions",
          value: 95000,
          unit: "kgCO2e/month",
          trend: "down",
        },
        {
          name: "Fuel Costs",
          value: 12500,
          unit: "USD/month",
          trend: "down",
        },
      ],
    },
  },
  {
    id: "3",
    title: "Implement Water Recovery System",
    description:
      "Install a greywater recovery and rainwater harvesting system to reduce potable water consumption.",
    difficulty: "Medium",
    priorityLevel: "Medium",
    estimatedTimeframe: "4-6 months",
    impact: "Significant reduction in water consumption and associated costs.",
    implementationSteps: [
      "Assess water usage patterns",
      "Design recovery system",
      "Obtain permits",
      "Install collection systems",
      "Install filtration and storage",
      "Implement monitoring",
      "Train maintenance staff",
    ],
    estimatedEmissionReduction: 15000,
    estimatedCost: 85000,
    relatedMetrics: ["Water Consumption", "Water Costs", "Recovery Rate"],
    tracking: {
      startDate: "2023-12-01",
      lastUpdated: "2024-01-09",
      status: "In Progress",
      progressPercentage: 45,
      notes: [
        "Completed water audit",
        "System design finalized",
        "Permits submitted",
        "Started installation of collection systems",
        "Storage tanks delivered",
      ],
      metrics: [
        {
          name: "Water Consumption",
          value: 125000,
          unit: "gallons/month",
          trend: "down",
        },
        {
          name: "Recovery Rate",
          value: 28,
          unit: "%",
          trend: "up",
        },
      ],
    },
  },
  {
    id: "4",
    title: "Zero Waste Program Implementation",
    description:
      "Develop and implement a comprehensive zero waste program including recycling, composting, and waste reduction initiatives.",
    difficulty: "Easy",
    priorityLevel: "Medium",
    estimatedTimeframe: "3-4 months",
    impact:
      "Significant reduction in waste sent to landfill and associated emissions.",
    implementationSteps: [
      "Conduct waste audit",
      "Develop sorting protocols",
      "Install bins and signage",
      "Train staff",
      "Establish vendor partnerships",
      "Launch awareness campaign",
      "Monitor and report progress",
    ],
    estimatedEmissionReduction: 75000,
    estimatedCost: 25000,
    relatedMetrics: ["Waste to Landfill", "Recycling Rate", "Cost Savings"],
    tracking: {
      startDate: "2024-01-01",
      lastUpdated: "2024-01-11",
      status: "In Progress",
      progressPercentage: 15,
      notes: [
        "Completed initial waste audit",
        "Draft protocol developed",
        "Researching bin options",
        "Meeting with potential vendors",
      ],
      metrics: [
        {
          name: "Waste to Landfill",
          value: 8500,
          unit: "kg/month",
          trend: "down",
        },
        {
          name: "Recycling Rate",
          value: 45,
          unit: "%",
          trend: "up",
        },
      ],
    },
  },
];

export const mockRecommendationData = mockRecommendationsData[0];

export default function TrackingPage() {
  const [recommendation, setRecommendation] = useState(mockRecommendationData);
  const [newNote, setNewNote] = useState("");

  const addNote = () => {
    if (newNote.trim()) {
      setRecommendation((prev) => ({
        ...prev,
        tracking: {
          ...prev.tracking,
          notes: [...prev.tracking.notes, newNote.trim()],
          lastUpdated: new Date().toISOString().split("T")[0],
        },
      }));
      setNewNote("");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Completed":
        return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
      case "In Progress":
        return <Clock className="h-5 w-5 text-amber-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
    }
  };

  const getStepStatus = (index: number) => {
    const stepProgress =
      index < recommendation.tracking.progressPercentage / 25;
    return stepProgress ? "text-emerald-600 font-medium" : "text-gray-500";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container max-w-6xl mx-auto p-6">
        <nav className="mb-8">
          <Link href="/" passHref>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Recommendations
            </Button>
          </Link>
        </nav>

        {/* Header Section */}
        <header className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-semibold text-gray-900">
              {recommendation.title}
            </h1>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">Status:</span>
              <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm">
                {getStatusIcon(recommendation.tracking.status)}
                <span className="font-medium text-gray-900">
                  {recommendation.tracking.status}
                </span>
              </div>
            </div>
          </div>
          <p className="text-gray-600 max-w-3xl">
            {recommendation.description}
          </p>
        </header>

        {/* Progress Bar */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Overall Progress</span>
                <span className="font-medium">
                  {recommendation.tracking.progressPercentage}%
                </span>
              </div>
              <Progress
                value={recommendation.tracking.progressPercentage}
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Key Details Card */}
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="text-lg">Key Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Difficulty</p>
                  <p className="font-medium">{recommendation.difficulty}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Priority</p>
                  <p className="font-medium">{recommendation.priorityLevel}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Timeframe</p>
                  <p className="font-medium">
                    {recommendation.estimatedTimeframe}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Cost</p>
                  <p className="font-medium">
                    ${recommendation.estimatedCost.toLocaleString()}
                  </p>
                </div>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-gray-500 mb-2">
                  Implementation Steps
                </p>
                <ul className="space-y-2">
                  {recommendation.implementationSteps.map((step, index) => (
                    <li
                      key={index}
                      className={`flex items-center gap-2 ${getStepStatus(
                        index
                      )}`}
                    >
                      <ChevronRight className="h-4 w-4" />
                      {step}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Metrics Card */}
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="text-lg">Impact Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="p-4 bg-emerald-50 rounded-lg">
                  <p className="text-sm text-emerald-600 mb-1">
                    Estimated Emission Reduction
                  </p>
                  <p className="text-2xl font-semibold text-emerald-700">
                    {recommendation.estimatedEmissionReduction.toLocaleString()}
                    <span className="text-base font-normal text-emerald-600 ml-1">
                      CO₂e
                    </span>
                  </p>
                </div>
                {recommendation.tracking.metrics.map((metric, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">{metric.name}</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {metric.value.toLocaleString()}
                      <span className="text-base font-normal text-gray-600 ml-1">
                        {metric.unit}
                      </span>
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Notes Section */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Progress Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recommendation.tracking.notes.map((note, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-gray-600">{note}</p>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Textarea
                placeholder="Add a new progress note..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="min-h-24"
              />
              <Button className="w-full sm:w-auto" onClick={addNote}>
                Add Note
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
