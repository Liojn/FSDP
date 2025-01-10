/* eslint-disable @typescript-eslint/no-explicit-any */
// src/services/recommendationService.ts

// eslint-disable-next-line @typescript-eslint/no-explicit-any

/**
 * Save recommendations to the backend.
 * @param userId - The ID of the user.
 * @param recommendations - The list of recommendations to save.
 */
export async function saveRecommendationsToBackend(
  userId: string,
  recommendations: any
): Promise<void> {
  try {
    const response = await fetch(`/api/recommendation/save`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, recommendations }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error saving recommendations:", errorData);
      throw new Error(errorData.message || "Failed to save recommendations.");
    }

    console.log("Recommendations successfully saved to the backend.");
  } catch (error) {
    console.error("Error saving recommendations to backend:", error);
    throw error;
  }
}

/**
 * Fetch recommendations from the backend.
 * @param userId - The ID of the user.
 * @param scopes - The list of scopes to filter recommendations.
 * @returns The recommendations data or null in case of an error.
 */
export async function fetchRecommendationsFromBackend(
  userId: string,
  scopes: string[]
): Promise<any | null> {
  try {
    const queryString = scopes.length
      ? `?scopes=${scopes.join(",")}`
      : ""; // Add scopes only if present
    const response = await fetch(
      `/api/recommendation/data/${userId}${queryString}`
    );

    if (response.ok) {
      const data = await response.json();
      console.log("Recommendations fetched from backend:", data);
      return data;
    }

    console.error("Failed to fetch recommendations from backend.");
    return null;
  } catch (error) {
    console.error("Error fetching recommendations from backend:", error);
    return null;
  }
}
