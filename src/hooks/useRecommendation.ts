// useRecommendations.ts
import useSWR from "swr";
import { Recommendation, TrackingRecommendation } from "@/types";

export const transformToTrackingRecommendation = (
  rec: Recommendation
): TrackingRecommendation => ({
  ...rec,
  status: rec.status as "Not Started" | "In Progress" | "Completed",
  progress: 0,
  trackingImplementationSteps: rec.implementationSteps.map((step, index) => ({
    id: index.toString(),
    step,
    complete: false,
  })),
  completedSteps: 0,
  notes: [],
});

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
    const updatedRecs = data?.map((rec) =>
      rec.id === recommendation.id ? recommendation : rec
    );
    await fetch(`/api/recommendation/update`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, recommendation }),
    });

    mutate(updatedRecs, false); // Update local cache without re-fetching
  };

  return { recommendations: data, error, isLoading, mutate, saveRecommendation };
}
