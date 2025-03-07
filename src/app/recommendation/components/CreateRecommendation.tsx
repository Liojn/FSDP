// src/app/recommendation/components/CreateRecommendation.tsx

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, X } from "lucide-react";
import { CategoryType, CreateRecommendationFormData } from "@/types";
import { Checkbox } from "@/components/ui/checkbox";

// Import the Zod schema
import { createRecommendationSchema } from "@/lib/schemas/recommendationSchema";

// Import the useToast hook from shadcn
import { useToast } from "@/hooks/use-toast";

interface CreateRecommendationProps {
  onSubmit: (recommendation: CreateRecommendationFormData) => void;
  userId: string;
  onCancel?: () => void;
}

const CreateRecommendation: React.FC<CreateRecommendationProps> = ({
  onSubmit,
  userId,
  onCancel,
}) => {
  const { toast } = useToast(); // Initialize toast
  const [isExpanded, setIsExpanded] = useState(false);
  const [formData, setFormData] = useState<CreateRecommendationFormData>({
    userId: userId || "",
    title: "",
    description: "",
    scope: "",
    impact: "",
    category: "" as CategoryType,
    estimatedEmissionReduction: 0,
    priorityLevel: "Medium",
    implementationSteps: [],
    difficulty: "Moderate",
    estimatedTimeframe: "",
  });

  const [newStep, setNewStep] = useState("");
  const [selectedScopes, setSelectedScopes] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submission attempted");
    console.log("Current form data:", formData);
    console.log("Selected scopes:", selectedScopes);

    // Combine selectedScopes into a single string
    const scopeString = selectedScopes.join(", ");

    // Construct an object to validate
    const dataToValidate: CreateRecommendationFormData = {
      ...formData,
      scope: scopeString,
    };

    // Validate using Zod
    const validationResult =
      createRecommendationSchema.safeParse(dataToValidate);

    if (!validationResult.success) {
      // Extract error messages
      const errorMessages = validationResult.error.errors.map(
        (err) => err.message
      );

      // Display each error as a separate toast
      errorMessages.forEach((message) => {
        toast({
          title: "Validation Error",
          description: message,
          variant: "destructive",
        });
      });

      console.log("Validation failed:", errorMessages);
      return;
    }

    console.log("All validation passed");
    const newRecommendation: CreateRecommendationFormData = {
      ...formData,
      scope: scopeString,
    };
    console.log("New recommendation data:", newRecommendation);

    try {
      onSubmit(newRecommendation);
      console.log("onSubmit called");
      resetForm();
      console.log("Form reset completed");
    } catch (error) {
      console.error("Submission error:", error);
      toast({
        title: "Submission Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    console.log("Resetting form");
    setIsExpanded(false);
    setFormData({
      userId: userId || "",
      title: "",
      description: "",
      scope: "",
      impact: "",
      category: "" as CategoryType,
      estimatedEmissionReduction: 0,
      priorityLevel: "Medium",
      implementationSteps: [],
      difficulty: "Moderate",
      estimatedTimeframe: "",
    });
    setSelectedScopes([]);
    setNewStep("");
    console.log("Form state after reset:", formData);
  };

  const addStep = () => {
    if (newStep.trim()) {
      setFormData((prev) => ({
        ...prev,
        implementationSteps: [...prev.implementationSteps, newStep.trim()],
      }));
      setNewStep("");
    } else {
      toast({
        title: "Invalid Step",
        description: "Implementation step cannot be empty.",
        variant: "destructive",
      });
    }
  };

  const removeStep = (index: number) => {
    setFormData((prev) => {
      const newSteps = [...prev.implementationSteps];
      newSteps.splice(index, 1);
      return { ...prev, implementationSteps: newSteps };
    });
  };

  const toggleScope = (scope: string) => {
    setSelectedScopes((prev) => {
      if (prev.includes(scope)) {
        return prev.filter((s) => s !== scope);
      }
      return [...prev, scope];
    });
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
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title, Description & Impact */}
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
            <div>
              <p className="text-sm font-medium mb-1">Impact</p>
              <Textarea
                id="impact"
                placeholder="Describe the impact of this recommendation"
                value={formData.impact}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    impact: e.target.value,
                  }))
                }
              />
            </div>
          </div>

          {/* Scopes */}
          <div className="flex space-x-4">
            {["Scope 1", "Scope 2", "Scope 3"].map((scope) => (
              <div key={scope} className="flex items-center">
                <Checkbox
                  id={scope}
                  checked={selectedScopes.includes(scope)}
                  onCheckedChange={() => toggleScope(scope)}
                />
                <label htmlFor={scope} className="ml-2 text-sm">
                  {scope}
                </label>
              </div>
            ))}
          </div>

          {/* Category & Estimated Emission Reduction */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium mb-1">Category</p>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    category: value as CategoryType,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(CategoryType).map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <p className="text-sm font-medium mb-1">
                Estimated Emission Reduction (kg CO₂e)
              </p>
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
                min="0"
                required
              />
            </div>
          </div>

          {/* Priority Level & Difficulty */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium mb-1">Priority Level</p>
              <Select
                value={formData.priorityLevel}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    priorityLevel: value as "Low" | "Medium" | "High",
                  }))
                }
                required
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
            <div>
              <p className="text-sm font-medium mb-1">Difficulty</p>
              <Select
                value={formData.difficulty}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    difficulty: value as "Moderate" | "Easy" | "Hard",
                  }))
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Easy">Easy</SelectItem>
                  <SelectItem value="Moderate">Moderate</SelectItem>
                  <SelectItem value="Hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Estimated Timeframe */}
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
              required
            />
          </div>

          {/* Implementation Steps */}
          <div className="space-y-3">
            <p className="text-sm font-medium">Implementation Steps</p>
            <div className="space-y-2">
              {formData.implementationSteps.map((step, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span>{step}</span>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => removeStep(index)}
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
              <Button type="button" variant="outline" onClick={addStep}>
                Add
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button type="submit" variant="default">
              Create Recommendation
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetForm();
                if (onCancel) onCancel();
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreateRecommendation;
