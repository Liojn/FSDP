import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, X } from "lucide-react";
import {
  TrackingRecommendation,
  CategoryType,
  Note,
  ImplementationStep,
} from "@/types";

interface CreateRecommendationProps {
  onSubmit: (recommendation: TrackingRecommendation) => void;
  onCancel?: () => void;
}

const CreateRecommendation: React.FC<CreateRecommendationProps> = ({
  onSubmit,
  onCancel,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [formData, setFormData] = useState<
    Omit<
      TrackingRecommendation,
      "id" | "status" | "progress" | "completedSteps" | "notes"
    >
  >({
    title: "",
    description: "",
    scope: "",
    impact: "",
    category: "" as CategoryType,
    estimatedEmissionReduction: 0,
    priorityLevel: "Medium",
    implementationSteps: [],
    difficulty: "Medium",
    estimatedTimeframe: "",
    trackingImplementationSteps: [],
    relatedMetrics: [],
  });

  const [newStep, setNewStep] = useState("");
  const [newMetric, setNewMetric] = useState("");

  const handleSubmit = () => {
    const newRecommendation: TrackingRecommendation = {
      ...formData,
      id: Date.now().toString(),
      status: "Not Started",
      progress: 0,
      completedSteps: 0,
      notes: [] as Note[],
    };

    onSubmit(newRecommendation);
    resetForm();
  };

  const resetForm = () => {
    setIsExpanded(false);
    setFormData({
      title: "",
      description: "",
      scope: "",
      impact: "",
      category: "" as CategoryType,
      estimatedEmissionReduction: 0,
      priorityLevel: "Medium",
      implementationSteps: [],
      difficulty: "Medium",
      estimatedTimeframe: "",
      trackingImplementationSteps: [],
      relatedMetrics: [],
    });
  };

  const addStep = () => {
    if (newStep.trim()) {
      const implementationStep: ImplementationStep = {
        id: Date.now().toString(),
        step: newStep.trim(),
        complete: false,
      };

      setFormData((prev) => ({
        ...prev,
        trackingImplementationSteps: [
          ...prev.trackingImplementationSteps,
          implementationStep,
        ],
        implementationSteps: [...prev.implementationSteps, newStep.trim()],
      }));
      setNewStep("");
    }
  };

  const removeStep = (stepId: string) => {
    setFormData((prev) => ({
      ...prev,
      trackingImplementationSteps: prev.trackingImplementationSteps.filter(
        (step) => step.id !== stepId
      ),
    }));
  };

  const addMetric = () => {
    if (newMetric.trim() && formData.relatedMetrics) {
      setFormData((prev) => ({
        ...prev,
        relatedMetrics: [...(prev.relatedMetrics || []), newMetric.trim()],
      }));
      setNewMetric("");
    }
  };

  const removeMetric = (metricToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      relatedMetrics: (prev.relatedMetrics || []).filter(
        (metric) => metric !== metricToRemove
      ),
    }));
  };

  if (!isExpanded) {
    return (
      <Button
        className="w-full py-8 border-2 border-dashed"
        variant="outline"
        onClick={() => setIsExpanded(true)}
      >
        <Plus className="mr-2 h-4 w-4" />
        Create New Recommendation
      </Button>
    );
  }

  return (
    <Card className="bg-white shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">
          Create New Recommendation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Title & Description */}
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium mb-1">Title</p>
            <Input
              placeholder="Enter recommendation title"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
            />
          </div>
          <div>
            <p className="text-sm font-medium mb-1">Description</p>
            <Textarea
              placeholder="Enter recommendation description"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
            />
          </div>
        </div>

        {/* Scope & Impact */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium mb-1">Scope</p>
            <Input
              placeholder="Enter scope"
              value={formData.scope}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, scope: e.target.value }))
              }
            />
          </div>
          <div>
            <p className="text-sm font-medium mb-1">Impact</p>
            <Input
              placeholder="Enter impact"
              value={formData.impact}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, impact: e.target.value }))
              }
            />
          </div>
        </div>

        {/* Category & Priority Level */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium mb-1">Category</p>
            <Input
              placeholder="Enter category"
              value={formData.category}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  category: e.target.value as CategoryType,
                }))
              }
            />
          </div>
          <div>
            <p className="text-sm font-medium mb-1">Priority Level</p>
            <Select
              value={formData.priorityLevel}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, priorityLevel: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Low">Low</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="High">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Estimates */}
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm font-medium mb-1">Emission Reduction</p>
            <Input
              type="number"
              placeholder="Enter estimated reduction"
              value={formData.estimatedEmissionReduction}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  estimatedEmissionReduction: parseFloat(e.target.value) || 0,
                }))
              }
            />
          </div>
        </div>

        {/* Timeframe & Difficulty */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium mb-1">Estimated Timeframe</p>
            <Input
              placeholder="Enter timeframe"
              value={formData.estimatedTimeframe}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  estimatedTimeframe: e.target.value,
                }))
              }
            />
          </div>
          <div>
            <p className="text-sm font-medium mb-1">Difficulty</p>
            <Select
              value={formData.difficulty}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, difficulty: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Easy">Easy</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Related Metrics */}
        <div className="space-y-3">
          <p className="text-sm font-medium">Related Metrics</p>
          <div className="flex gap-2 flex-wrap">
            {formData.relatedMetrics?.map((metric) => (
              <Badge
                key={metric}
                variant="secondary"
                className="flex items-center gap-1"
              >
                {metric}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeMetric(metric)}
                  className="h-4 w-4 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Add related metric"
              value={newMetric}
              onChange={(e) => setNewMetric(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addMetric();
                }
              }}
            />
            <Button variant="outline" onClick={addMetric}>
              Add
            </Button>
          </div>
        </div>

        {/* Implementation Steps */}
        <div className="space-y-3">
          <p className="text-sm font-medium">Implementation Steps</p>
          <div className="space-y-2">
            {formData.trackingImplementationSteps.map((step) => (
              <div key={step.id} className="flex items-center gap-2">
                <span>{step.step}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeStep(step.id)}
                  className="ml-auto"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Add implementation step"
              value={newStep}
              onChange={(e) => setNewStep(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addStep();
                }
              }}
            />
            <Button variant="outline" onClick={addStep}>
              Add
            </Button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button onClick={handleSubmit}>Create Recommendation</Button>
          <Button
            variant="outline"
            onClick={() => {
              resetForm();
              if (onCancel) onCancel();
            }}
          >
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CreateRecommendation;
