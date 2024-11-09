"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { GoalManagementForm } from "./GoalManagementForm";
import { strategicDataService } from "@/lib/services/strategicDataService";
import { useToast } from "@/hooks/use-toast";
import type { StrategicGoal } from "@/types/strategic";

export function StrategicGoalManager() {
  const [goals, setGoals] = useState<StrategicGoal[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Partial<StrategicGoal> | undefined>();
  const { toast } = useToast();

  useEffect(() => {
    fetchGoals();
    fetchRecommendations();
  }, []);

  const fetchGoals = async () => {
    try {
      // Mock initial goals - replace with actual API call when ready
      const mockGoals: StrategicGoal[] = [
        {
          id: "1",
          title: "Carbon Neutral Operations",
          description: "Achieve carbon neutrality across all operations",
          department: "Operations",
          status: "In Progress",
          progress: 45,
          targetDate: "2024-12-31",
          metrics: ["carbon_emissions", "renewable_energy"]
        },
        {
          id: "2",
          title: "Zero Waste Initiative",
          description: "Implement zero waste practices across facilities",
          department: "Facilities",
          status: "Not Started",
          progress: 0,
          targetDate: "2024-06-30",
          metrics: ["waste_reduction", "recycling_rate"]
        }
      ];
      setGoals(mockGoals);
    } catch (error) {
      console.error("Goals fetch error:", error);
      toast({
        title: "Error",
        description: "Unable to load strategic goals",
        variant: "destructive",
      });
    }
  };

  const fetchRecommendations = async () => {
    try {
      const recommendations = await strategicDataService.generateRecommendations({
        metrics: [],
        goals: goals,
        department: "Operations"
      });
      console.log("Recommendations:", recommendations);
    } catch (error) {
      console.error("Recommendations fetch error:", error);
    }
  };

  const handleGoalCreated = (goal: StrategicGoal) => {
    setGoals((prevGoals) => {
      const existingGoalIndex = prevGoals.findIndex((g) => g.id === goal.id);
      if (existingGoalIndex > -1) {
        const updatedGoals = [...prevGoals];
        updatedGoals[existingGoalIndex] = goal;
        return updatedGoals;
      }
      return [...prevGoals, goal];
    });
    setIsFormOpen(false);
    setSelectedGoal(undefined);
  };

  const handleDeleteGoal = async (goalId: string) => {
    try {
      setGoals((prevGoals) => prevGoals.filter((g) => g.id !== goalId));
      toast({
        title: "Goal Deleted",
        description: "The strategic goal has been successfully removed",
      });
    } catch (error) {
      console.error("Goal deletion error:", error);
      toast({
        title: "Error",
        description: "Unable to delete strategic goal",
        variant: "destructive",
      });
    }
  };

  const handleEditGoal = (goal: StrategicGoal) => {
    setSelectedGoal(goal);
    setIsFormOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800";
      case "In Progress":
        return "bg-blue-100 text-blue-800";
      case "At Risk":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Strategic Goal Management</CardTitle>
          <Button
            variant="outline"
            onClick={() => {
              setSelectedGoal(undefined);
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
              initialGoal={selectedGoal}
              onGoalCreated={handleGoalCreated}
              onCancel={() => {
                setIsFormOpen(false);
                setSelectedGoal(undefined);
              }}
            />
          </div>
        )}

        <div className="space-y-4">
          {goals.map((goal) => (
            <div
              key={goal.id}
              className="border rounded-lg p-4 hover:shadow-sm transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">{goal.title}</h3>
                  <p className="text-sm text-gray-500">{goal.description}</p>
                  <div className="mt-2 text-sm">
                    <span className="font-medium">Department:</span> {goal.department}
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${getStatusColor(
                      goal.status
                    )}`}
                  >
                    {goal.status}
                  </span>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Progress</span>
                  <span className="text-sm text-gray-500">{goal.progress}%</span>
                </div>
                <Progress value={goal.progress} className="h-2" />
              </div>
              <div className="mt-4 flex justify-between items-center">
                <div>
                  <span className="text-xs text-gray-500">
                    Target Date: {new Date(goal.targetDate).toLocaleDateString()}
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
                    onClick={() => handleDeleteGoal(goal.id)}
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
