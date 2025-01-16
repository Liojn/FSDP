"use client";

import { useState } from "react";
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
  Search,
  Plus,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Note, TrackingRecommendation } from "@/types";

interface TrackingCardProps {
  recommendation: TrackingRecommendation;
  onUpdate: (updatedRecommendation: TrackingRecommendation) => void;
}

export function TrackingCard({
  recommendation: initialRecommendation,
  onUpdate,
}: TrackingCardProps) {
  const [recommendation, setRecommendation] = useState(initialRecommendation);
  const [editMode, setEditMode] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [newNote, setNewNote] = useState("");
  const [newStep, setNewStep] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [editedFields, setEditedFields] = useState(() => ({
    title: initialRecommendation.title,
    description: initialRecommendation.description,
    scope: initialRecommendation.scope,
    impact: initialRecommendation.impact,
    category: initialRecommendation.category || "",
    trackingImplementationSteps: [
      ...initialRecommendation.trackingImplementationSteps,
    ],
  }));
  console.log("Recommendation ID:", recommendation.id);

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
          body: JSON.stringify(updatedRecommendation),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save recommendation to the database.");
      }

      const data = await response.json();
      console.log("Saved recommendation:", data);
    } catch (error) {
      console.error("Error in saveToDatabase:", error);
    }
  };

  const handleStepCompletion = (stepIndex: number) => {
    const updatedSteps = [...recommendation.trackingImplementationSteps];
    updatedSteps[stepIndex].complete = true;

    const completedSteps = updatedSteps.filter((s) => s.complete).length;
    const newStatus: "Completed" | "In Progress" | "Not Started" =
      completedSteps === updatedSteps.length ? "Completed" : "In Progress";
    const newProgress = (completedSteps / updatedSteps.length) * 100;

    const updatedRecommendation = {
      ...recommendation,
      trackingImplementationSteps: updatedSteps,
      completedSteps,
      progress: newProgress,
      status: newStatus,
    };

    setRecommendation(updatedRecommendation);
    onUpdate(updatedRecommendation);

    // Save progress to the database
    saveToDatabase(updatedRecommendation);
  };

  const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewNote(e.target.value);
  };

  const addNote = () => {
    if (newNote.trim()) {
      const note: Note = {
        id: Date.now().toString(),
        content: newNote,
        timestamp: new Date().toLocaleDateString(),
      };

      const updatedRecommendation = {
        ...recommendation,
        notes: [...recommendation.notes, note],
      };

      setRecommendation(updatedRecommendation);
      onUpdate(updatedRecommendation);

      // Save updated notes to the database
      saveToDatabase(updatedRecommendation);

      setNewNote("");
    }
  };

  const deleteNote = (noteId: string) => {
    const updatedRecommendation = {
      ...recommendation,
      notes: recommendation.notes.filter((note) => note.id !== noteId),
    };

    setRecommendation(updatedRecommendation);
    onUpdate(updatedRecommendation);

    // Save updated notes to the database
    saveToDatabase(updatedRecommendation);
  };

  const handleFieldChange = (
    field: keyof typeof editedFields,
    value: string
  ) => {
    setEditedFields((prev) => ({ ...prev, [field]: value }));
  };

  async function addStep() {
    if (newStep.trim()) {
      const step = {
        id: Date.now().toString(),
        step: newStep,
        complete: false,
      };

      try {
        const response = await fetch(
          `/api/recommendation/data/${recommendation.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: localStorage.getItem("userId") || "",
              newStep: step,
            }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to add step.");
        }

        const updatedSteps = [
          ...recommendation.trackingImplementationSteps,
          step,
        ];
        setRecommendation({
          ...recommendation,
          trackingImplementationSteps: updatedSteps,
        });
        onUpdate({
          ...recommendation,
          trackingImplementationSteps: updatedSteps,
        });
        setNewStep(""); // Clear the input
      } catch (error) {
        console.error("Error adding step:", error);
      }
    }
  }

  const saveChanges = async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updatedFields: any = {};

    // Add only fields that were edited
    if (editedFields.title !== recommendation.title) {
      updatedFields.title = editedFields.title;
    }
    if (editedFields.description !== recommendation.description) {
      updatedFields.description = editedFields.description;
    }
    if (editedFields.scope !== recommendation.scope) {
      updatedFields.scope = editedFields.scope;
    }
    if (editedFields.impact !== recommendation.impact) {
      updatedFields.impact = editedFields.impact;
    }
    if (editedFields.category !== recommendation.category) {
      updatedFields.category = editedFields.category;
    }

    try {
      const response = await fetch(
        `/api/recommendation/data/${recommendation.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: localStorage.getItem("userId") || "",
            ...updatedFields,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save changes.");
      }

      const data = await response.json();
      console.log("Updated recommendation:", data);

      // Update local state
      setRecommendation({
        ...recommendation,
        ...updatedFields,
      });
      onUpdate({
        ...recommendation,
        ...updatedFields,
      });
      setEditMode(false);
    } catch (error) {
      console.error("Error saving changes:", error);
    }
  };

  const cancelChanges = () => {
    setEditedFields({
      title: recommendation.title,
      description: recommendation.description,
      scope: recommendation.scope,
      impact: recommendation.impact,
      category: recommendation.category || "",
      trackingImplementationSteps: [
        ...recommendation.trackingImplementationSteps,
      ],
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
    ? editedFields.trackingImplementationSteps.filter((step) =>
        step.step.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : recommendation.trackingImplementationSteps.filter((step) =>
        step.step.toLowerCase().includes(searchTerm.toLowerCase())
      );

  return (
    <Card className="bg-white shadow-sm">
      <CardHeader>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1 w-full">
              {editMode ? (
                <div className="space-y-2">
                  <Input
                    value={editedFields.title}
                    onChange={(e) => handleFieldChange("title", e.target.value)}
                    className="font-semibold text-xl"
                  />
                  <Textarea
                    value={editedFields.description}
                    onChange={(e) =>
                      handleFieldChange("description", e.target.value)
                    }
                    className="mt-2"
                  />
                </div>
              ) : (
                <>
                  <CardTitle className="text-xl font-semibold">
                    {recommendation.title}
                  </CardTitle>
                  <CardDescription>
                    {recommendation.description}
                  </CardDescription>
                </>
              )}
            </div>
            <Badge
              variant="outline"
              className="flex items-center gap-2 whitespace-nowrap py-2"
            >
              {getStatusIcon(recommendation.status)}
              {recommendation.status}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium mb-1">Scope</p>
            {editMode ? (
              <Input
                value={editedFields.scope}
                onChange={(e) => handleFieldChange("scope", e.target.value)}
              />
            ) : (
              <p>{recommendation.scope}</p>
            )}
          </div>
          <div>
            <p className="text-sm font-medium mb-1">Impact</p>
            {editMode ? (
              <Input
                value={editedFields.impact}
                onChange={(e) => handleFieldChange("impact", e.target.value)}
              />
            ) : (
              <p>{recommendation.impact}</p>
            )}
          </div>
        </div>
        <div>
          <p className="text-sm font-medium mb-1">Category</p>
          {editMode ? (
            <Input
              value={editedFields.category}
              onChange={(e) => handleFieldChange("category", e.target.value)}
            />
          ) : (
            <p>{recommendation.category || "—"}</p>
          )}
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Progress</p>
            <p className="text-sm">
              {recommendation.completedSteps} of{" "}
              {recommendation.trackingImplementationSteps.length} steps
            </p>
          </div>
          <Progress value={recommendation.progress} className="h-2" />
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Implementation Steps</p>
            <div className="flex items-center gap-2">
              <Input
                placeholder="Search steps..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-8"
              />
              <Search className="w-4 h-4 text-gray-500" />
            </div>
          </div>
          <ul className="space-y-4">
            {filteredSteps.map((step, index) => (
              <li key={step.id} className="flex items-center gap-3">
                <Button
                  variant={step.complete ? "secondary" : "outline"}
                  size="sm"
                  disabled={step.complete}
                  onClick={() => handleStepCompletion(index)}
                >
                  {step.complete ? "Completed" : "Mark Complete"}
                </Button>
                <span
                  className={step.complete ? "line-through text-gray-400" : ""}
                >
                  {step.step}
                </span>
              </li>
            ))}
          </ul>
          {editMode && (
            <div className="flex items-center gap-2 mt-2">
              <Input
                placeholder="Add new step..."
                value={newStep}
                onChange={(e) => setNewStep(e.target.value)}
              />
              <Button variant="outline" size="sm" onClick={addStep}>
                <Plus className="w-4 h-4" />
                Add Step
              </Button>
            </div>
          )}
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Notes</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowNotes(!showNotes)}
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
                  onChange={handleNoteChange}
                  className="bg-white"
                />
                <Button onClick={addNote} size="sm">
                  Add Note
                </Button>
              </div>
              {recommendation.notes.length > 0 && (
                <div className="space-y-3">
                  {recommendation.notes.map((note) => (
                    <div
                      key={note.id}
                      className="p-3 bg-gray-50 rounded-md flex justify-between items-start"
                    >
                      <div>
                        <p className="text-sm">{note.content}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {note.timestamp}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteNote(note.id)}
                        className="text-gray-500 hover:text-gray-700"
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
        <div className="flex gap-2">
          {!editMode ? (
            <Button
              variant="outline"
              onClick={() => setEditMode(true)}
              size="sm"
            >
              Edit Details
            </Button>
          ) : (
            <>
              <Button
                variant="default"
                onClick={saveChanges}
                size="sm"
                className="gap-2"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </Button>
              <Button variant="outline" onClick={cancelChanges} size="sm">
                Cancel
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
