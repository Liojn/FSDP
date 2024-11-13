"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";

interface ScopeThreshold {
  id: string;
  scope: "Scope 1" | "Scope 2" | "Scope 3";
  description: string;
  value: number;
  unit: string;
}

const defaultDescriptions = {
  "Scope 1": "Direct emissions from owned or controlled sources",
  "Scope 2":
    "Indirect emissions from purchased electricity, steam, heating, and cooling",
  "Scope 3": "All other indirect emissions in the value chain",
};

const defaultThresholds: ScopeThreshold[] = [
  {
    id: "scope1",
    scope: "Scope 1",
    value: 500,
    unit: "tons CO₂e",
    description: defaultDescriptions["Scope 1"],
  },
  {
    id: "scope2",
    scope: "Scope 2",
    value: 1000,
    unit: "tons CO₂e",
    description: defaultDescriptions["Scope 2"],
  },
  {
    id: "scope3",
    scope: "Scope 3",
    value: 1500,
    unit: "tons CO₂e",
    description: defaultDescriptions["Scope 3"],
  },
];

export default function ThresholdSettings() {
  const [thresholds, setThresholds] =
    useState<ScopeThreshold[]>(defaultThresholds);
  const [mainGoals, setMainGoals] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    const userId = localStorage.getItem("userId");

    if (!userId) {
      console.warn("No userId found. Skipping threshold fetch.");
      return;
    }

    const fetchUserThresholds = async () => {
      try {
        // Update the endpoint to fetch the last emission goal
        const response = await fetch(`/api/update-goals?userId=${userId}`);
        if (response.ok) {
          const data = await response.json();
          if (
            data.lastEmissionGoal &&
            data.lastEmissionGoal.target !== undefined
          ) {
            setMainGoals(data.lastEmissionGoal.target.toString()); // Set mainGoals directly
          }
        } else {
          console.error("Failed to fetch last emission goal");
        }
      } catch (error) {
        console.error("Error fetching last emission goal:", error);
      }
    };

    fetchUserThresholds();
  }, []);

  const handleThresholdChange = (
    index: number,
    updates: Partial<ScopeThreshold>
  ) => {
    const updatedThresholds = [...thresholds];
    if (updates.value !== undefined) {
      updates.value = updates.value === 0 ? undefined : updates.value;
    }
    updatedThresholds[index] = { ...updatedThresholds[index], ...updates };
    setThresholds(updatedThresholds);
  };

  const handleSaveChanges = async () => {
    const userId = localStorage.getItem("userId");

    if (!userId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "User not authenticated. Please log in.",
      });
      return;
    }

    try {
      const updatePromises = [
        ...thresholds.map((threshold) =>
          fetch("/api/thresholds", {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userId,
              scope: threshold.scope,
              value: threshold.value,
              unit: threshold.unit,
            }),
          }).then(async (response) => {
            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.error || "Failed to update threshold");
            }
            return response.json();
          })
        ),
        fetch("/api/update-goals", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            mainGoals: parseFloat(mainGoals),
            userId,
          }),
        }),
      ];

      await Promise.all(updatePromises);
      toast({
        title: "Success",
        description: "All settings updated successfully",
      });
    } catch (error) {
      console.error("Failed to update thresholds:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to update settings",
      });
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Edit Threshold and Goals Settings</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Emission Scope Thresholds and Goals</SheetTitle>
          <SheetDescription>
            Set custom thresholds for each emission scope and an overall
            emissions goal.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-2 mt-4">
          {thresholds.map((threshold, index) => (
            <div key={threshold.id} className="space-y-4">
              <div className="space-y-1">
                <Label>{threshold.scope}</Label>
                <p className="text-sm text-gray-500">{threshold.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor={`threshold-${index}`}>Threshold Value</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id={`threshold-${index}`}
                      type="number"
                      value={threshold.value === 0 ? "" : threshold.value}
                      onChange={(e) => {
                        const value =
                          e.target.value === ""
                            ? undefined
                            : Math.max(Number(e.target.value), 1);
                        handleThresholdChange(index, { value });
                      }}
                      placeholder="Enter threshold value"
                      min={1}
                      className="flex-grow"
                    />
                    <span className="text-gray-700 font-semibold">kg CO₂e</span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div className="space-y-4 mt-6">
            <Label htmlFor="mainGoals">
              Overall Carbon Emissions Goal (% Reduction)
            </Label>
            <Input
              id="mainGoals"
              type="number"
              min="0"
              step="0.01"
              value={mainGoals}
              onChange={(e) => setMainGoals(e.target.value)}
            />
          </div>
        </div>

        <SheetFooter className="mt-6">
          <Button type="button" onClick={handleSaveChanges}>
            Save Changes
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
