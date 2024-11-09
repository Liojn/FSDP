"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { validateGoal } from "@/lib/validation";
import { StrategicGoal } from "@/app/api/goals/route";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface GoalManagementFormProps {
  onGoalCreated?: (goal: StrategicGoal) => void;
  initialGoal?: Partial<StrategicGoal>;
}

export function GoalManagementForm({
  onGoalCreated,
  initialGoal = {},
}: GoalManagementFormProps) {
  const { toast } = useToast();
  const [goal, setGoal] = useState<Partial<StrategicGoal>>({
    title: initialGoal.title || "",
    description: initialGoal.description || "",
    department: initialGoal.department || "",
    targetDate: initialGoal.targetDate || "",
    progress: initialGoal.progress ?? 0,
    status: initialGoal.status || "Not Started",
  });

  const [errors, setErrors] = useState<string[]>([]);

  const recommendGoalBenchmarks = useCallback(async () => {
    const recommendations = await fetch("/api/ai-recommendations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentGoal: goal }),
    });
    const data = await recommendations.json();
    setGoal((prevGoal) => ({
      ...prevGoal,
      targetDate: data.targetDate,
      progress: data.suggestedProgress,
    }));
  }, [goal]);

  useEffect(() => {
    recommendGoalBenchmarks(); // Trigger recommendations on load or on goal change
  }, [goal, recommendGoalBenchmarks]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate the goal
    const validationResult = validateGoal(goal);

    if (!validationResult.isValid) {
      setErrors(validationResult.errors);
      toast({
        title: "Validation Error",
        description: validationResult.errors.join(", "),
        variant: "destructive",
      });
      return;
    }

    try {
      // Determine if we're creating or updating
      const endpoint = initialGoal._id
        ? `/api/goals?id=${initialGoal._id}`
        : "/api/goals";

      const method = initialGoal._id ? "PUT" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(goal),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save goal");
      }

      const savedGoal = await response.json();

      toast({
        title: "Goal Saved",
        description: `Goal "${savedGoal.title}" has been successfully ${
          method === "POST" ? "created" : "updated"
        }`,
        variant: "default",
      });

      // Reset form or call callback
      if (onGoalCreated) {
        onGoalCreated(savedGoal);
      }

      // Reset form
      setGoal({
        title: "",
        description: "",
        department: "",
        targetDate: "",
        progress: 0,
        status: "Not Started",
      });
      setErrors([]);
    } catch (error) {
      console.error("Error saving goal:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Goal Title</Label>
        <Input
          id="title"
          value={goal.title}
          onChange={(e) => setGoal({ ...goal, title: e.target.value })}
          placeholder="Enter goal title"
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={goal.description}
          onChange={(e) => setGoal({ ...goal, description: e.target.value })}
          placeholder="Provide a detailed description of the goal"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="department">Department</Label>
          <Select
            value={goal.department}
            onValueChange={(value) => setGoal({ ...goal, department: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Sustainability">Sustainability</SelectItem>
              <SelectItem value="Operations">Operations</SelectItem>
              <SelectItem value="Facilities">Facilities</SelectItem>
              <SelectItem value="Energy">Energy</SelectItem>
              <SelectItem value="Finance">Finance</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="status">Status</Label>
          <Select
            value={goal.status}
            onValueChange={(value) => setGoal({ ...goal, status: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Not Started">Not Started</SelectItem>
              <SelectItem value="In Progress">In Progress</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="targetDate">Target Date</Label>
          <Input
            id="targetDate"
            type="date"
            value={goal.targetDate}
            onChange={(e) => setGoal({ ...goal, targetDate: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="progress">Progress (%)</Label>
          <Input
            id="progress"
            type="number"
            min="0"
            max="100"
            value={goal.progress}
            onChange={(e) =>
              setGoal({ ...goal, progress: Number(e.target.value) })
            }
            placeholder="Enter progress percentage"
          />
        </div>
      </div>

      <Button type="submit" className="w-full">
        {initialGoal._id ? "Update Goal" : "Create Goal"}
      </Button>

      {errors.length > 0 && (
        <div className="text-red-500 text-sm mt-2">
          {errors.map((error, index) => (
            <p key={index}>{error}</p>
          ))}
        </div>
      )}
    </form>
  );
}
