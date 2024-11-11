"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { useToast } from "@/hooks/use-toast";

interface Threshold {
  id: string;
  category: string;
  metric: string;
  value: number;
  unit: string;
}

const defaultThresholds = [
  { category: "emissions", metric: "CO₂", defaultValue: 500, unit: "tons" },
  {
    category: "energy",
    metric: "Electricity",
    defaultValue: 10000,
    unit: "kWh",
  },
  { category: "waste", metric: "Production", defaultValue: 50, unit: "tons" },
  { category: "fuel", metric: "Usage", defaultValue: 1000, unit: "liters" },
];

export default function ThresholdSettings() {
  const [thresholds, setThresholds] = useState<Threshold[]>([]);
  const [loading, setLoading] = useState(true);
  const [newThreshold, setNewThreshold] = useState({
    category: "",
    metric: "",
    value: 0,
    unit: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchThresholds();
  }, []);

  const fetchThresholds = async () => {
    try {
      const response = await fetch("/api/thresholds");
      const data = await response.json();
      setThresholds(data.thresholds);
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch thresholds",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddThreshold = async () => {
    try {
      const response = await fetch("/api/thresholds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newThreshold),
      });

      if (!response.ok) throw new Error("Failed to add threshold");

      const data = await response.json();
      setThresholds([...thresholds, data.threshold]);
      setNewThreshold({ category: "", metric: "", value: 0, unit: "" });

      toast({
        title: "Success",
        description: "Threshold added successfully",
      });
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add threshold",
      });
    }
  };

  const handleDeleteThreshold = async (id: string) => {
    try {
      const response = await fetch(`/api/thresholds?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete threshold");

      setThresholds(thresholds.filter((t) => t.id !== id));
      toast({
        title: "Success",
        description: "Threshold deleted successfully",
      });
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete threshold",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Threshold Settings</CardTitle>
        <CardDescription>
          Set custom thresholds for sustainability metrics. You&apos;ll receive
          alerts when these thresholds are exceeded.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Add New Threshold Form */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={newThreshold.category}
                onValueChange={(value) =>
                  setNewThreshold({ ...newThreshold, category: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="emissions">Emissions</SelectItem>
                  <SelectItem value="energy">Energy</SelectItem>
                  <SelectItem value="waste">Waste</SelectItem>
                  <SelectItem value="fuel">Fuel</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="metric">Metric</Label>
              <Input
                id="metric"
                value={newThreshold.metric}
                onChange={(e) =>
                  setNewThreshold({ ...newThreshold, metric: e.target.value })
                }
                placeholder="e.g., CO₂"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="value">Value</Label>
              <Input
                id="value"
                type="number"
                value={newThreshold.value}
                onChange={(e) =>
                  setNewThreshold({
                    ...newThreshold,
                    value: Number(e.target.value),
                  })
                }
                placeholder="Enter threshold value"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit">Unit</Label>
              <Input
                id="unit"
                value={newThreshold.unit}
                onChange={(e) =>
                  setNewThreshold({ ...newThreshold, unit: e.target.value })
                }
                placeholder="e.g., tons"
              />
            </div>
          </div>

          <Button onClick={handleAddThreshold} className="w-full">
            Add Threshold
          </Button>

          {/* Default Thresholds */}
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              Suggested Thresholds
            </h3>
            <div className="grid grid-cols-1 gap-2">
              {defaultThresholds.map((threshold) => (
                <div
                  key={threshold.metric}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
                >
                  <span>
                    {threshold.metric}: {threshold.defaultValue}{" "}
                    {threshold.unit}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setNewThreshold({
                        category: threshold.category,
                        metric: threshold.metric,
                        value: threshold.defaultValue,
                        unit: threshold.unit,
                      })
                    }
                  >
                    Use
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Current Thresholds */}
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              Current Thresholds
            </h3>
            {loading ? (
              <div className="text-center py-4">Loading...</div>
            ) : thresholds.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                No thresholds set
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2">
                {thresholds.map((threshold) => (
                  <div
                    key={threshold.id}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
                  >
                    <span>
                      {threshold.metric}: {threshold.value} {threshold.unit}
                    </span>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteThreshold(threshold.id)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
