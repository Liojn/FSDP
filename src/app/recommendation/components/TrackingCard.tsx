"use client";

import { useCallback, useEffect, useState } from "react";
import debounce from "lodash/debounce";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  Trash2,
  Save,
  Plus,
} from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { Badge } from "@/components/ui/badge";
import { Note, TrackingRecommendation, CategoryType } from "@/types";

interface TrackingCardProps {
  recommendation: TrackingRecommendation;
  onUpdate: (updatedRecommendation: TrackingRecommendation) => void;
}

export function TrackingCard({
  recommendation: initialRecommendation,
  onUpdate,
}: TrackingCardProps) {
  const [recommendation, setRecommendation] = useState({
    ...initialRecommendation,
    trackingImplementationSteps:
      initialRecommendation.trackingImplementationSteps || [],
  });

  const [editMode, setEditMode] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [newNote, setNewNote] = useState("");
  const [newStep, setNewStep] = useState("");
  const [searchTerm] = useState("");
  // Initialize editedFields with notes array
  const [editedFields, setEditedFields] = useState(() => ({
    title: initialRecommendation.title,
    description: initialRecommendation.description,
    scope: initialRecommendation.scope,
    impact: initialRecommendation.impact,
    category: initialRecommendation.category || CategoryType.CUSTOM,
    priorityLevel: initialRecommendation.priorityLevel || "",
    difficulty: initialRecommendation.difficulty || "",
    estimatedEmissionReduction:
      initialRecommendation.estimatedEmissionReduction || 0,
    estimatedTimeframe: initialRecommendation.estimatedTimeframe || "",
    trackingImplementationSteps: [
      ...initialRecommendation.trackingImplementationSteps,
    ],
    notes: [...(initialRecommendation.notes || [])], // Ensure notes are initialized
  }));

  useEffect(() => {
    const fetchRecommendation = async () => {
      try {
        const baseUrl =
          process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
        const response = await fetch(
          `${baseUrl}/api/recommendation/data/${recommendation.id}`
        );
        if (!response.ok) throw new Error("Failed to fetch recommendation");

        const data = await response.json();

        if (data.error) {
          throw new Error(data.error);
        }

        if (!data.recommendation) {
          throw new Error("Recommendation not found in response");
        }

        // Set the fetched recommendation
        setRecommendation(data.recommendation);
        setEditedFields({
          ...data.recommendation,
        });
      } catch (error) {
        console.error("Error fetching recommendation:", error);
        // Optionally, handle the error in the UI
      }
    };

    fetchRecommendation();
  }, [recommendation.id]);

  const saveToDatabase = async (
    updatedRecommendation: TrackingRecommendation
  ) => {
    try {
      const baseUrl =
        process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
      const response = await fetch(
        `${baseUrl}/api/recommendation/data/${updatedRecommendation.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: localStorage.getItem("userId") || "",
            ...updatedRecommendation,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save recommendation to the database.");
      }

      return await response.json();
    } catch (error) {
      console.error("Error in saveToDatabase:", error);
      throw error;
    }
  };

  const toggleStepCompletion = async (stepIndex: number) => {
    try {
      // Create a new recommendation object with the updated step
      const updatedSteps = [
        ...(recommendation.trackingImplementationSteps || []),
      ];
      const step = updatedSteps[stepIndex];
      const newComplete = !step.complete; // Store the new completion state
      step.complete = newComplete;

      // Calculate new status and progress
      const completedSteps = updatedSteps.filter((s) => s.complete).length;
      const newProgress =
        updatedSteps.length > 0
          ? Math.round((completedSteps / updatedSteps.length) * 100)
          : 0;

      const newStatus: "Not Started" | "In Progress" | "Completed" = (() => {
        if (completedSteps === updatedSteps.length && updatedSteps.length > 0) {
          return "Completed";
        } else if (completedSteps > 0) {
          return "In Progress";
        }
        return "Not Started";
      })();

      const updatedRecommendation = {
        ...recommendation,
        trackingImplementationSteps: updatedSteps,
        completedSteps,
        progress: newProgress,
        status: newStatus,
      };

      // Save to database first
      const response = await saveToDatabase(updatedRecommendation);

      if (!response || !response.recommendation) {
        throw new Error("Invalid server response");
      }

      // Only update local state and parent after successful server response
      setRecommendation(response.recommendation);
      onUpdate(response.recommendation);
    } catch (error) {
      console.error("Error in toggleStepCompletion:", error);
      // Revert to previous state on error
      setRecommendation(recommendation);
      onUpdate(recommendation);
      alert("Failed to update step status. Please try again.");
    }
  };

  // Inside the TrackingCard component:
  const debouncedToggle = useCallback(
    debounce(async (stepIndex: number) => {
      await toggleStepCompletion(stepIndex);
    }, 300),
    [toggleStepCompletion]
  );

  const addNote = async () => {
    if (newNote.trim()) {
      const note: Note = {
        id: uuidv4(), // Use UUID for step ID
        content: newNote,
        timestamp: new Date().toLocaleDateString(),
      };

      try {
        const response = await fetch(
          `/api/recommendation/data/${recommendation.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: localStorage.getItem("userId") || "",
              note, // <-- pass the new note only
            }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to add note.");
        }

        // Update local state optimistically
        const updatedRecommendation = {
          ...recommendation,
          notes: [...(recommendation.notes || []), note],
        };
        setRecommendation(updatedRecommendation);
        onUpdate(updatedRecommendation); // Notify parent immediately

        // Also update editedFields if in editMode
        if (editMode) {
          setEditedFields((prev) => ({
            ...prev,
            notes: [...prev.notes, note],
          }));
        }

        setNewNote("");
      } catch (error) {
        console.error("Error adding note:", error);
      }
    }
  };

  const deleteNote = async (noteId: string) => {
    // Optimistically update the local state by removing the note
    const updatedNotes = (recommendation.notes || []).filter(
      (note) => note.id !== noteId
    );
    const previousNotes = recommendation.notes || [];
    setRecommendation((prev) => ({
      ...prev,
      notes: updatedNotes,
    }));
    onUpdate({
      ...recommendation,
      notes: updatedNotes,
    });

    // Also update editedFields if in editMode
    if (editMode) {
      setEditedFields((prev) => ({
        ...prev,
        notes: updatedNotes,
      }));
    }

    try {
      const response = await fetch(
        `/api/recommendation/data/${recommendation.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: localStorage.getItem("userId") || "",
            notes: updatedNotes, // Send the updated notes array
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete note.");
      }

      const data = await response.json();

      // Optionally, update the state with the response from the backend
      setRecommendation(data.recommendation);
      onUpdate({
        ...data.recommendation,
      });

      // Also update editedFields if in editMode
      if (editMode) {
        setEditedFields({
          ...data.recommendation,
        });
      }
    } catch (error) {
      console.error("Error deleting note:", error);
      // Revert the optimistic update
      setRecommendation((prev) => ({
        ...prev,
        notes: previousNotes,
      }));
      onUpdate({
        ...recommendation,
        notes: previousNotes,
      });

      if (editMode) {
        setEditedFields((prev) => ({
          ...prev,
          notes: previousNotes,
        }));
      }

      // Optionally, notify the user about the failure
      alert("Failed to delete note. Please try again.");
    }
  };

  const deleteStep = async (stepId: string) => {
    // Find the step to be deleted
    const stepToDelete = recommendation.trackingImplementationSteps.find(
      (step) => step.id === stepId
    );
    if (!stepToDelete) return;

    // Optimistically update the local state by removing the step
    const updatedSteps = recommendation.trackingImplementationSteps.filter(
      (step) => step.id !== stepId
    );
    const previousSteps = recommendation.trackingImplementationSteps;

    setRecommendation((prev) => ({
      ...prev,
      trackingImplementationSteps: updatedSteps,
    }));
    onUpdate({
      ...recommendation,
      trackingImplementationSteps: updatedSteps,
    });

    // Also update editedFields if in editMode
    if (editMode) {
      setEditedFields((prev) => ({
        ...prev,
        trackingImplementationSteps: prev.trackingImplementationSteps.filter(
          (step) => step.id !== stepId
        ),
      }));
    }

    try {
      // Send the updated steps to the backend
      const response = await fetch(
        `/api/recommendation/data/${recommendation.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: localStorage.getItem("userId") || "",
            trackingImplementationSteps: updatedSteps,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete step.");
      }

      // Optionally, you can process the response if needed
      const data = await response.json();
      setRecommendation(data.recommendation);
      onUpdate(data.recommendation);

      // Update editedFields if in editMode
      if (editMode) {
        setEditedFields({
          ...data.recommendation,
        });
      }
    } catch (error) {
      console.error("Error deleting step:", error);
      // Revert the optimistic update
      setRecommendation((prev) => ({
        ...prev,
        trackingImplementationSteps: previousSteps,
      }));
      onUpdate({
        ...recommendation,
        trackingImplementationSteps: previousSteps,
      });

      if (editMode) {
        setEditedFields((prev) => ({
          ...prev,
          trackingImplementationSteps: previousSteps,
        }));
      }

      // Optionally, notify the user about the failure
      alert("Failed to delete step. Please try again.");
    }
  };

  const handleFieldChange = (
    field: keyof typeof editedFields,
    value: string | number
  ) => {
    setEditedFields((prev) => ({ ...prev, [field]: value }));
  };

  const addStep = async () => {
    if (newStep.trim()) {
      const step = {
        id: uuidv4(),
        step: newStep,
        complete: false,
      };

      // Create the new updated recommendation with the new step
      const updatedRecommendation = {
        ...recommendation,
        trackingImplementationSteps: [
          ...(recommendation.trackingImplementationSteps || []),
          step,
        ],
      };

      // Update local state immediately for instant feedback
      setRecommendation(updatedRecommendation);
      setNewStep(""); // Clear input field immediately

      // If in editMode, also update editedFields
      if (editMode) {
        setEditedFields((prev) => ({
          ...prev,
          trackingImplementationSteps: [
            ...prev.trackingImplementationSteps,
            step,
          ],
        }));
      }

      try {
        // Send the complete updated recommendation to the backend
        const response = await fetch(
          `/api/recommendation/data/${recommendation.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: localStorage.getItem("userId") || "",
              trackingImplementationSteps:
                updatedRecommendation.trackingImplementationSteps,
            }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to add step");
        }

        // Don't update state from server response since we already have the correct state
        // Just notify parent of the update
        onUpdate(updatedRecommendation);
      } catch (error) {
        console.error("Error adding step:", error);

        // Revert the optimistic update on error
        setRecommendation(recommendation);
        onUpdate(recommendation);

        if (editMode) {
          setEditedFields((prev) => ({
            ...prev,
            trackingImplementationSteps:
              prev.trackingImplementationSteps.filter((s) => s.id !== step.id),
          }));
        }

        setNewStep(step.step); // Restore the input value
        alert("Failed to add step. Please try again.");
      }
    }
  };

  const saveChanges = async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updatedFieldsToSave: any = {};

    // Add only fields that were edited
    if (editedFields.title !== recommendation.title) {
      updatedFieldsToSave.title = editedFields.title;
    }
    if (editedFields.description !== recommendation.description) {
      updatedFieldsToSave.description = editedFields.description;
    }
    if (editedFields.scope !== recommendation.scope) {
      updatedFieldsToSave.scope = editedFields.scope;
    }
    if (editedFields.impact !== recommendation.impact) {
      updatedFieldsToSave.impact = editedFields.impact;
    }
    if (editedFields.category !== recommendation.category) {
      updatedFieldsToSave.category = editedFields.category;
    }

    // -- Additional fields we decided to add --
    if (editedFields.priorityLevel !== recommendation.priorityLevel) {
      updatedFieldsToSave.priorityLevel = editedFields.priorityLevel;
    }
    if (editedFields.difficulty !== recommendation.difficulty) {
      updatedFieldsToSave.difficulty = editedFields.difficulty;
    }
    if (
      editedFields.estimatedEmissionReduction !==
      recommendation.estimatedEmissionReduction
    ) {
      updatedFieldsToSave.estimatedEmissionReduction =
        editedFields.estimatedEmissionReduction;
    }
    if (editedFields.estimatedTimeframe !== recommendation.estimatedTimeframe) {
      updatedFieldsToSave.estimatedTimeframe = editedFields.estimatedTimeframe;
    }

    // Send the updates to the backend
    try {
      const response = await fetch(
        `/api/recommendation/data/${recommendation.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: localStorage.getItem("userId") || "",
            ...updatedFieldsToSave,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save changes.");
      }

      // Merge updates into local state
      const updatedRecommendation = {
        ...recommendation,
        ...updatedFieldsToSave,
      };
      setRecommendation(updatedRecommendation);
      onUpdate(updatedRecommendation);

      // Also update editedFields to match the saved state
      setEditedFields({
        ...updatedRecommendation,
      });

      setEditMode(false);
    } catch (error) {
      console.error("Error saving changes:", error);
    }
  };

  const cancelChanges = () => {
    setEditedFields({
      title: initialRecommendation.title,
      description: initialRecommendation.description,
      scope: initialRecommendation.scope,
      impact: initialRecommendation.impact,
      category: initialRecommendation.category || CategoryType.CUSTOM,
      priorityLevel: initialRecommendation.priorityLevel || "",
      difficulty: initialRecommendation.difficulty || "",
      estimatedEmissionReduction:
        initialRecommendation.estimatedEmissionReduction || 0,
      estimatedTimeframe: initialRecommendation.estimatedTimeframe || "",
      trackingImplementationSteps: [
        ...initialRecommendation.trackingImplementationSteps,
      ],
      notes: [...(initialRecommendation.notes || [])], // Ensure notes are initialized
    });
    setEditMode(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Completed":
        return <CheckCircle2 className="w-4 h-4" />;
      case "In Progress":
        return <Clock className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const filteredSteps = editMode
    ? editedFields.trackingImplementationSteps?.filter((step) =>
        step.step.toLowerCase().includes(searchTerm.toLowerCase())
      ) || []
    : recommendation.trackingImplementationSteps?.filter((step) =>
        step.step.toLowerCase().includes(searchTerm.toLowerCase())
      ) || [];

  return (
    <Card className="bg-white shadow-sm border">
      <CardHeader>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1 w-full">
              {editMode ? (
                <div className="space-y-2">
                  <Input
                    value={editedFields.title}
                    onChange={(e) => handleFieldChange("title", e.target.value)}
                    className="font-semibold text-xl border-lime-200 focus:ring-lime-500 focus:border-lime-500"
                  />
                  <Textarea
                    value={editedFields.description}
                    onChange={(e) =>
                      handleFieldChange("description", e.target.value)
                    }
                    className="mt-2 border-lime-200 focus:ring-lime-500 focus:border-lime-500"
                  />
                </div>
              ) : (
                <>
                  <CardTitle className="text-xl font-semibold text-gray-900">
                    {recommendation.title}
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    {recommendation.description}
                  </CardDescription>
                </>
              )}
            </div>
            <Badge
              variant="outline"
              className="flex items-center gap-2 whitespace-nowrap py-2 border border-lime-200 bg-lime-100 text-lime-900"
            >
              {getStatusIcon(recommendation.status)}
              {recommendation.status}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Scope and Impact */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Scope</p>
            {editMode ? (
              <Input
                value={editedFields.scope}
                onChange={(e) => handleFieldChange("scope", e.target.value)}
                className="border-lime-200 focus:ring-lime-500 focus:border-lime-500"
              />
            ) : (
              <p className="text-gray-900">{recommendation.scope}</p>
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Impact</p>
            {editMode ? (
              <Input
                value={editedFields.impact}
                onChange={(e) => handleFieldChange("impact", e.target.value)}
                className="border-lime-200 focus:ring-lime-500 focus:border-lime-500"
              />
            ) : (
              <p className="text-gray-900">{recommendation.impact}</p>
            )}
          </div>
        </div>

        {/* Additional Fields */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">
              Priority Level
            </p>
            {editMode ? (
              <Input
                value={editedFields.priorityLevel}
                onChange={(e) =>
                  handleFieldChange("priorityLevel", e.target.value)
                }
                className="border-lime-200 focus:ring-lime-500 focus:border-lime-500"
              />
            ) : (
              <p className="text-gray-900">
                {recommendation.priorityLevel || "—"}
              </p>
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">
              Estimated Emission Reduction (kg CO₂e)
            </p>
            {editMode ? (
              <Input
                type="number"
                value={editedFields.estimatedEmissionReduction}
                onChange={(e) =>
                  handleFieldChange(
                    "estimatedEmissionReduction",
                    Number(e.target.value)
                  )
                }
                className="border-lime-200 focus:ring-lime-500 focus:border-lime-500"
              />
            ) : (
              <p className="text-gray-900">
                {recommendation.estimatedEmissionReduction?.toLocaleString() ||
                  "—"}
              </p>
            )}
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Difficulty</p>
            {editMode ? (
              <Input
                value={editedFields.difficulty}
                onChange={(e) =>
                  handleFieldChange("difficulty", e.target.value)
                }
                className="border-lime-200 focus:ring-lime-500 focus:border-lime-500"
              />
            ) : (
              <p className="text-gray-900">
                {recommendation.difficulty || "—"}
              </p>
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">
              Estimated Timeframe
            </p>
            {editMode ? (
              <Input
                value={editedFields.estimatedTimeframe}
                onChange={(e) =>
                  handleFieldChange("estimatedTimeframe", e.target.value)
                }
                className="border-lime-200 focus:ring-lime-500 focus:border-lime-500"
              />
            ) : (
              <p className="text-gray-900">
                {recommendation.estimatedTimeframe || "—"}
              </p>
            )}
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-500">Progress</p>
            <p className="text-sm text-gray-900">
              {recommendation.completedSteps} of{" "}
              {recommendation.trackingImplementationSteps.length} steps
            </p>
          </div>
          <Progress value={recommendation.progress} className="h-2" />
        </div>

        {/* Steps */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-gray-500">
            Implementation Steps
          </p>
          <ul className="space-y-4">
            {filteredSteps.map((step, index) => (
              <li key={step.id} className="flex items-center gap-3">
                <Button
                  variant={step.complete ? "outline" : "secondary"}
                  size="sm"
                  onClick={() => debouncedToggle(index)}
                  className={
                    step.complete
                      ? "border-lime-200 text-lime-700 hover:bg-lime-100"
                      : "bg-lime-100 text-lime-700"
                  }
                >
                  {step.complete ? "Mark Incomplete" : "Mark Complete"}
                </Button>
                <span
                  className={
                    step.complete
                      ? "line-through text-gray-400"
                      : "text-gray-900"
                  }
                >
                  {step.step}
                </span>
                {/* Delete Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteStep(step.id)}
                  className="text-red-500 hover:text-red-700 ml-auto"
                  aria-label="Delete Step"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </li>
            ))}
          </ul>

          {editMode && (
            <div className="flex items-center gap-2 mt-2">
              <Input
                placeholder="Add new step..."
                value={newStep}
                onChange={(e) => setNewStep(e.target.value)}
                className="border-lime-200 focus:ring-lime-500 focus:border-lime-500"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={addStep}
                className="border-lime-200 text-lime-700 hover:bg-lime-100"
              >
                <Plus className="w-4 h-4" />
                Add Step
              </Button>
            </div>
          )}
        </div>

        {/* Notes */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-500">
              Notes ({(recommendation.notes || []).length})
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowNotes(!showNotes)}
              className="border-lime-200 text-lime-700 hover:bg-lime-100"
            >
              {showNotes ? "Hide Notes" : "Show Notes"}
            </Button>
          </div>
          {showNotes && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Textarea
                  placeholder="Add a new note..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="bg-white border-lime-200 focus:ring-lime-500 focus:border-lime-500"
                />
                <Button
                  onClick={addNote}
                  size="sm"
                  className="bg-lime-200 text-lime-900 hover:bg-lime-300"
                >
                  Add Note
                </Button>
              </div>
              {recommendation.notes && recommendation.notes.length > 0 && (
                <div className="space-y-3">
                  {recommendation.notes.map((note) => (
                    <div
                      key={note.id}
                      className="p-3 bg-lime-50 rounded-md flex justify-between items-start"
                    >
                      <div>
                        <p className="text-sm text-gray-900">{note.content}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {note.timestamp}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteNote(note.id)}
                        className="text-gray-500 hover:text-lime-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Edit / Save / Cancel Buttons */}
        <div className="flex gap-2">
          {!editMode ? (
            <Button
              variant="outline"
              onClick={() => setEditMode(true)}
              size="sm"
              className="border-lime-200 text-lime-700 hover:bg-lime-100"
            >
              Edit Details
            </Button>
          ) : (
            <>
              <Button
                variant="default"
                onClick={saveChanges}
                size="sm"
                className="gap-2 bg-lime-200 text-lime-900 hover:bg-lime-300"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </Button>
              <Button
                variant="outline"
                onClick={cancelChanges}
                size="sm"
                className="border-lime-200 text-lime-700 hover:bg-lime-100"
              >
                Cancel
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
