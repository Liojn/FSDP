"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

export default function ThresholdSettings() {
  const [thresholds, setThresholds] = useState<ScopeThreshold[]>([
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
  ]);

  const { toast } = useToast();

  // Update local state without making API calls
  const handleThresholdChange = (
    index: number,
    updates: Partial<ScopeThreshold>
  ) => {
    const updatedThresholds = [...thresholds];
    updatedThresholds[index] = { ...updatedThresholds[index], ...updates };
    setThresholds(updatedThresholds);
  };

  // Save all changes at once
  const handleSaveChanges = async () => {
    try {
      const updatePromises = thresholds.map((threshold) =>
        fetch("/api/thresholds", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: threshold.id,
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
      );

      await Promise.all(updatePromises);
      toast({
        title: "Success",
        description: "All threshold settings updated successfully",
      });
    } catch (error) {
      console.error("Failed to update thresholds:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to update threshold settings",
      });
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Edit Threshold Settings</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Emission Scope Thresholds</SheetTitle>
          <SheetDescription>
            Set custom thresholds for each emission scope to receive alerts when
            exceeded.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 mt-4">
          {thresholds.map((threshold, index) => (
            <div key={threshold.id} className="space-y-4">
              <div className="space-y-1">
                <Label>{threshold.scope}</Label>
                <p className="text-sm text-gray-500">{threshold.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor={`threshold-${index}`}>Threshold Value</Label>
                  <Input
                    id={`threshold-${index}`}
                    type="number"
                    value={threshold.value}
                    onChange={(e) =>
                      handleThresholdChange(index, {
                        value: Number(e.target.value),
                      })
                    }
                    placeholder="Enter threshold value"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor={`unit-${index}`}>Unit</Label>
                  <Select
                    value={threshold.unit}
                    onValueChange={(value) =>
                      handleThresholdChange(index, { unit: value })
                    }
                  >
                    <SelectTrigger id={`unit-${index}`}>
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tons CO₂e">tons CO₂e</SelectItem>
                      <SelectItem value="kg CO₂e">kg CO₂e</SelectItem>
                      <SelectItem value="metric tons">metric tons</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          ))}
        </div>

        <SheetFooter className="mt-6">
          <Button type="submit" onClick={handleSaveChanges}>
            Save Changes
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
