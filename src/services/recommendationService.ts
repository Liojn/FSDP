// src/services/recommendationService.ts

/* eslint-disable @typescript-eslint/no-explicit-any */

// Save recommendations to the backend.
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
    // Build query string only if scopes are present
    const queryString = scopes.length
      ? `?scopes=${scopes.join(",")}`
      : "";

    // Fetch existing recommendations from the database
    const response = await fetch(`/api/recommendation/data/${userId}${queryString}`);

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error fetching recommendations:", errorData);
      return null;
    }

    const data = await response.json();
    const { recommendations } = data;

    if (recommendations && recommendations.length > 0) {
      console.log("Existing recommendations found:", recommendations);
      return data; // Return existing recommendations
    }

    console.log("No existing recommendations found. Generating new recommendations...");

    // If no recommendations exist, generate new ones
    const generationResponse = await fetch(`/api/recommendation`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ metrics: data.metrics, weatherData: data.weatherData, scopes }),
    });

    if (!generationResponse.ok) {
      throw new Error(
        `Failed to generate recommendations: ${generationResponse.statusText}`
      );
    }

    const generatedData = await generationResponse.json();
    return generatedData; // Return newly generated recommendations
  } catch (error) {
    console.error("Error in fetching or generating recommendations:", error);
    return null;
  }
}