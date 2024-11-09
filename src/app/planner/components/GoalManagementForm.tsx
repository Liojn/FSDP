"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { StrategicGoal } from "@/types/strategic";

interface GoalManagementFormProps {
  initialGoal?: Partial<StrategicGoal>;
  onGoalCreated: (goal: StrategicGoal) => void;
  onCancel: () => void;
}

export function GoalManagementForm({
  initialGoal,
  onGoalCreated,
  onCancel,
}: GoalManagementFormProps) {
  const [formData, setFormData] = useState<Partial<StrategicGoal>>({
    title: "",
    description: "",
    department: "",
    status: "Not Started",
    progress: 0,
    targetDate: "",
    metrics: [],
    ...initialGoal,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newGoal: StrategicGoal = {
      id: initialGoal?.id || Date.now().toString(),
      title: formData.title || "",
      description: formData.description || "",
      department: formData.department || "",
      status: formData.status as StrategicGoal["status"] || "Not Started",
      progress: formData.progress || 0,
      targetDate: formData.targetDate || new Date().toISOString(),
      metrics: formData.metrics || []
    };

    onGoalCreated(newGoal);
  };

  const handleChange = (
    field: keyof StrategicGoal,
    value: string | number | string[]
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Title</label>
        <Input
          value={formData.title || ""}
          onChange={(e) => handleChange("title", e.target.value)}
          placeholder="Enter goal title"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <Textarea
          value={formData.description || ""}
          onChange={(e) => handleChange("description", e.target.value)}
          placeholder="Enter goal description"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Department</label>
        <Select
          value={formData.department}
          onValueChange={(value) => handleChange("department", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Operations">Operations</SelectItem>
            <SelectItem value="Facilities">Facilities</SelectItem>
            <SelectItem value="Supply Chain">Supply Chain</SelectItem>
            <SelectItem value="Manufacturing">Manufacturing</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Status</label>
        <Select
          value={formData.status}
          onValueChange={(value) => handleChange("status", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Not Started">Not Started</SelectItem>
            <SelectItem value="In Progress">In Progress</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
            <SelectItem value="At Risk">At Risk</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Progress (%)</label>
        <Input
          type="number"
          min="0"
          max="100"
          value={formData.progress || 0}
          onChange={(e) => handleChange("progress", parseInt(e.target.value, 10))}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Target Date</label>
        <Input
          type="date"
          value={formData.targetDate ? new Date(formData.targetDate).toISOString().split('T')[0] : ""}
          onChange={(e) => handleChange("targetDate", new Date(e.target.value).toISOString())}
          required
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {initialGoal ? "Update Goal" : "Create Goal"}
        </Button>
      </div>
    </form>
  );
}
