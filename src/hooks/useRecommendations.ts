// src/hooks/useRecommendations.ts

import useSWR from "swr";
import { TrackingRecommendation, Recommendation, CreateRecommendationFormData } from "@/types";

export const transformToTrackingRecommendation = (
  rec: Recommendation & Partial<TrackingRecommendation>
): TrackingRecommendation => {
  const trackingImplementationSteps =
    rec.trackingImplementationSteps && rec.trackingImplementationSteps.length > 0
      ? rec.trackingImplementationSteps
      : (rec.implementationSteps || []).map((step, index) => ({
          id: `${rec.id}-step-${index}`,
          step,
          complete: false,
        }));

  const notes = rec.notes || [];

  const totalSteps = trackingImplementationSteps.length;
  const completedSteps =
    typeof rec.completedSteps === "number"
      ? rec.completedSteps
      : trackingImplementationSteps.filter((s) => s.complete).length;

  const progress =
    typeof rec.progress === "number"
      ? rec.progress
      : totalSteps > 0
      ? (completedSteps / totalSteps) * 100
      : 0;

  let status = rec.status as "Not Started" | "In Progress" | "Completed";
  if (!status || !["Not Started", "In Progress", "Completed"].includes(status)) {
    status = "Not Started";
  }

  return {
    ...rec,
    trackingImplementationSteps,
    notes,
    completedSteps,
    progress,
    status,
  };
};

export function useRecommendations(userId: string, scopes: string[]) {
  const fetcher = async (): Promise<TrackingRecommendation[]> => {
    const dataRes = await fetch(
      `/api/recommendation/data/${userId}?scopes=${scopes.join(",")}`
    );
    const { metrics, weatherData, recommendations } = await dataRes.json();

    if (!recommendations || recommendations.length === 0) {
      console.log("No existing recommendations. Generating...");
      const postRes = await fetch(`/api/recommendation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ metrics, weatherData, scopes, userId }),
      });

      if (!postRes.ok) {
        throw new Error("Failed to generate recommendations via AI");
      }

      const postData = await postRes.json();
      return postData.recommendations.map(transformToTrackingRecommendation);
    }

    return recommendations.map(transformToTrackingRecommendation);
  };

  const { data, error, isLoading, mutate } = useSWR(
    userId ? [`recommendations`, userId, scopes] : null,
    fetcher,
    { revalidateOnFocus: false }
  );

  // Function to save (update) a recommendation
  const saveRecommendation = async (recommendation: TrackingRecommendation) => {
    try {
      const updatedRecs = data?.map((rec) =>
        rec.id === recommendation.id ? recommendation : rec
      );

      console.log("Before mutate (optimistic):", updatedRecs);
      mutate(updatedRecs, false); // Optimistically update the state

      const response = await fetch(`/api/recommendation/data/${recommendation.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...recommendation,
          userId, // Ensure userId is included
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save recommendation");
      }

      const updatedRecommendation = await response.json();

      console.log("Updated recommendation from backend:", updatedRecommendation);

      mutate(); // Revalidate to fetch the latest data
    } catch (error) {
      console.error("Error saving recommendation:", error);
      mutate(data, false); // Revert optimistic update
    }
  };

  // **New Function: Create a new recommendation**
  const createRecommendation = async (
    recommendation: CreateRecommendationFormData
  ) => {
    try {
      const payload = {
        ...recommendation,
      };

      const response = await fetch(`/api/recommendation/add`, { // Updated endpoint
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create recommendation");
      }

      const createdRecommendation: TrackingRecommendation = await response.json();

      // Update the SWR cache by adding the new recommendation
      mutate((currentData) => [...(currentData || []), createdRecommendation], false);
    } catch (error) {
      console.error("Error creating recommendation:", error);
      // Optionally, show a toast or notification to the user
      // Revalidate the data to ensure consistency
      mutate();
      throw error; // Re-throw to handle it in the component if needed
    }
  };

  return { recommendations: data, error, isLoading, mutate, saveRecommendation, createRecommendation };
}
