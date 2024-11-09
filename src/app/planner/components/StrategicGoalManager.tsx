"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { GoalManagementForm } from "./GoalManagementForm";
import { StrategicGoal } from "@/app/api/goals/route";
import { useToast } from "@/hooks/use-toast";

export default function StrategicGoalManager() {
  const [goals, setGoals] = useState<StrategicGoal[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] =
    useState<Partial<StrategicGoal> | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchGoals();
  }, []);

  useEffect(() => {
    const fetchRealTimeUpdates = async () => {
      const updates = await fetch("/api/realtime-updates");
      const data = await updates.json();
      setGoals(data.goals); // Update goals with real-time insights
    };
    fetchRealTimeUpdates();
  }, []);

  const fetchGoals = async () => {
    try {
      const response = await fetch("/api/goals");
      if (!response.ok) {
        throw new Error("Failed to fetch goals");
      }
      const data = await response.json();
      setGoals(data);
    } catch (error) {
      console.error("Goals fetch error:", error);
      toast({
        title: "Error",
        description: "Unable to load goals",
        variant: "destructive",
      });
    }
  };

  const handleGoalCreated = (newGoal: StrategicGoal) => {
    // Update goals list
    setGoals((prevGoals) => {
      // Check if goal already exists (update) or is new
      const existingGoalIndex = prevGoals.findIndex(
        (g) => g._id === newGoal._id
      );

      if (existingGoalIndex > -1) {
        // Update existing goal
        const updatedGoals = [...prevGoals];
        updatedGoals[existingGoalIndex] = newGoal;
        return updatedGoals;
      } else {
        // Add new goal
        return [...prevGoals, newGoal];
      }
    });

    // Close form and reset selected goal
    setIsFormOpen(false);
    setSelectedGoal(null);
  };

  const handleDeleteGoal = async (goalId: string) => {
    try {
      const response = await fetch(`/api/goals?id=${goalId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete goal");
      }

      // Remove goal from list
      setGoals((prevGoals) =>
        prevGoals.filter((g) => g._id?.toString() !== goalId)
      );

      toast({
        title: "Goal Deleted",
        description: "The goal has been successfully removed",
        variant: "default",
      });
    } catch (error) {
      console.error("Goal deletion error:", error);
      toast({
        title: "Error",
        description: "Unable to delete goal",
        variant: "destructive",
      });
    }
  };

  const handleEditGoal = (goal: StrategicGoal) => {
    setSelectedGoal(goal);
    setIsFormOpen(true);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Strategic Goal Management</CardTitle>
          <Button
            variant="outline"
            onClick={() => {
              setSelectedGoal(null);
              setIsFormOpen(true);
            }}
          >
            Create New Goal
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {isFormOpen && (
          <div className="mb-6">
            <GoalManagementForm
              initialGoal={selectedGoal || undefined}
              onGoalCreated={handleGoalCreated}
            />
          </div>
        )}

        <div className="space-y-4">
          {goals.map((goal) => (
            <div
              key={goal._id?.toString()}
              className="border rounded-lg p-4 hover:shadow-sm transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">{goal.title}</h3>
                  <p className="text-sm text-gray-500">{goal.description}</p>
                  <div className="mt-2 text-sm">
                    <span className="font-medium">Department:</span>{" "}
                    {goal.department}
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      goal.status === "Completed"
                        ? "bg-green-100 text-green-800"
                        : goal.status === "In Progress"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {goal.status}
                  </span>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Progress</span>
                  <span className="text-sm text-gray-500">
                    {goal.progress}%
                  </span>
                </div>
                <Progress value={goal.progress} className="h-2" />
              </div>
              <div className="mt-4 flex justify-between items-center">
                <div>
                  <span className="text-xs text-gray-500">
                    Target Date:{" "}
                    {goal.targetDate
                      ? new Date(goal.targetDate).toLocaleDateString()
                      : "Not set"}
                  </span>
                </div>
                <div className="space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEditGoal(goal)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() =>
                      goal._id && handleDeleteGoal(goal._id.toString())
                    }
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
