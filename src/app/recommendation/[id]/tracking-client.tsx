"use client";

import { useState, useEffect } from "react";
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
import { useToast } from "@/hooks/use-toast";

interface TrackingPageProps {
  recommendationId: string;
}

export default function TrackingPage({ recommendationId }: TrackingPageProps) {
  interface TrackingRecommendation {
    title: string;
    description: string;
    difficulty: string;
    priorityLevel: string;
    estimatedTimeframe: string;
    estimatedCost: number;
    estimatedEmissionReduction: number;
    implementationSteps: string[];
    tracking: {
      status: string;
      progressPercentage: number;
      metrics: { name: string; value: number; unit: string }[];
      notes: string[];
    };
  }

  const [recommendation, setRecommendation] =
    useState<TrackingRecommendation | null>(null);
  const [newNote, setNewNote] = useState("");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchRecommendationData = async () => {
      try {
        const userId = localStorage.getItem("userId");
        if (!userId) throw new Error("User ID not found");

        const response = await fetch(
          `/api/recommendation/data/${recommendationId}?userId=${userId}`
        );
        if (!response.ok) throw new Error("Failed to fetch recommendation");

        const data = await response.json();
        setRecommendation(data);
      } catch {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load recommendation data",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendationData();
  }, [recommendationId, toast]);

  const addNote = async () => {
    if (!newNote.trim()) return;

    try {
      const userId = localStorage.getItem("userId");
      if (!userId) throw new Error("User ID not found");

      const response = await fetch(
        `/api/recommendation/${recommendationId}/notes`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
            note: newNote.trim(),
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to add note");

      const updatedRecommendation = await response.json();
      setRecommendation(updatedRecommendation);
      setNewNote("");

      toast({
        title: "Success",
        description: "Note added successfully",
      });
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add note",
      });
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
    if (!recommendation?.tracking?.progressPercentage) return "text-gray-500";
    const stepProgress =
      index < recommendation.tracking.progressPercentage / 25;
    return stepProgress ? "text-emerald-600 font-medium" : "text-gray-500";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>Loading recommendation data...</p>
      </div>
    );
  }

  if (!recommendation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>Recommendation not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container max-w-6xl mx-auto p-6">
        <nav className="mb-8">
          <Link href="/recommendations" passHref>
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

        <header className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-semibold text-gray-900">
              {recommendation.title}
            </h1>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">Status:</span>
              <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm">
                {getStatusIcon(recommendation.tracking?.status)}
                <span className="font-medium text-gray-900">
                  {recommendation.tracking?.status || "Not Started"}
                </span>
              </div>
            </div>
          </div>
          <p className="text-gray-600 max-w-3xl">
            {recommendation.description}
          </p>
        </header>

        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Overall Progress</span>
                <span className="font-medium">
                  {recommendation.tracking?.progressPercentage || 0}%
                </span>
              </div>
              <Progress
                value={recommendation.tracking?.progressPercentage || 0}
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-8 md:grid-cols-2">
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
                    ${recommendation.estimatedCost?.toLocaleString()}
                  </p>
                </div>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-gray-500 mb-2">
                  Implementation Steps
                </p>
                <ul className="space-y-2">
                  {recommendation.implementationSteps?.map(
                    (step: string, index: number) => (
                      <li
                        key={index}
                        className={`flex items-center gap-2 ${getStepStatus(
                          index
                        )}`}
                      >
                        <ChevronRight className="h-4 w-4" />
                        {step}
                      </li>
                    )
                  )}
                </ul>
              </div>
            </CardContent>
          </Card>

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
                    {recommendation.estimatedEmissionReduction?.toLocaleString()}
                    <span className="text-base font-normal text-emerald-600 ml-1">
                      CO₂e
                    </span>
                  </p>
                </div>
                {recommendation.tracking?.metrics?.map(
                  (
                    metric: { name: string; value: number; unit: string },
                    index: number
                  ) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">
                        {metric.name}
                      </p>
                      <p className="text-2xl font-semibold text-gray-900">
                        {metric.value.toLocaleString()}
                        <span className="text-base font-normal text-gray-600 ml-1">
                          {metric.unit}
                        </span>
                      </p>
                    </div>
                  )
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Progress Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recommendation.tracking?.notes?.map(
                  (note: string, index: number) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-gray-600">{note}</p>
                    </div>
                  )
                )}
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
