import useSWR from "swr";
import {
  fetchRecommendationsFromBackend,
  saveRecommendationsToBackend,
} from "@/services/recommendationService";
import { Recommendation, TrackingRecommendation } from "@/types";

export const transformToTrackingRecommendation = (
  rec: Recommendation
): TrackingRecommendation => {
  return {
    // Spread all original Recommendation fields
    ...rec,

    // Narrow the status if you like (or just keep it as rec.status)
    status: rec.status as "Not Started" | "In Progress" | "Completed",

    // Add new tracking fields
    progress: 0,
    trackingImplementationSteps: rec.implementationSteps.map((step, index) => ({
      id: index.toString(),
      step,
      complete: false,
    })),
    completedSteps: 0,
    notes: [],
  };
};

export function useRecommendations(userId: string, scopes: string[]) {
  const fetcher = async (): Promise<TrackingRecommendation[]> => {
    const backendData = await fetchRecommendationsFromBackend(userId, scopes);
    return backendData?.recommendations.map(transformToTrackingRecommendation) || [];
  };

  const { data, error, isLoading, mutate } = useSWR(
    userId ? [`recommendations`, userId, scopes] : null,
    fetcher,
    { revalidateOnFocus: false }
  );

  const saveRecommendation = async (recommendation: TrackingRecommendation) => {
    const recommendations = data || [];
    const updatedRecommendations = recommendations.map((rec) =>
      rec.id === recommendation.id ? recommendation : rec
    );
    await saveRecommendationsToBackend(userId, updatedRecommendations);
    mutate(updatedRecommendations, false); // Update local cache
  };

  return { recommendations: data, error, isLoading, saveRecommendation };
}
