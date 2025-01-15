// useRecommendations.ts
import useSWR from "swr";
import { Recommendation, TrackingRecommendation } from "@/types";

export const transformToTrackingRecommendation = (
  rec: Recommendation & Partial<TrackingRecommendation>
): TrackingRecommendation => {
  // If the server already has "trackingImplementationSteps" (with "complete" flags, etc.), use them.
  // Otherwise, construct them from "implementationSteps".
  const trackingImplementationSteps =
    rec.trackingImplementationSteps && rec.trackingImplementationSteps.length > 0
      ? rec.trackingImplementationSteps
      : (rec.implementationSteps || []).map((step, index) => ({
          id: index.toString(),
          step,
          complete: false,
        }));

  // Keep 'notes' if the server returns them, else default to empty array.
  const notes = rec.notes || [];

  // Keep 'progress' if it’s already in the server data, else compute or default to 0.
  // Same for 'completedSteps'.
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

  // For status, keep the narrower union, default if missing or invalid.
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
        body: JSON.stringify({ metrics, weatherData, scopes }),
      });

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
          userId,  // This must be a valid string
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



  return { recommendations: data, error, isLoading, mutate, saveRecommendation };
}
