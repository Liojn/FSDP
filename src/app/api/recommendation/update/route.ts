// recommendation/update/route.ts
import { saveRecommendationUpdates } from "@/services/recommendationService";
import { NextResponse } from "next/server";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    // Validate the ID
    if (!id) {
      return NextResponse.json(
        { error: "Missing or invalid recommendation ID" },
        { status: 400 }
      );
    }

    // Parse and validate the request body
    const body = await req.json();
    if (!body || Object.keys(body).length === 0) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    // Call the service function to update the recommendation
    const updatedRecommendation = await saveRecommendationUpdates(id, body);

    // Return the updated recommendation
    return NextResponse.json(updatedRecommendation, { status: 200 });
  } catch (error) {
    console.error("Error updating recommendation:", error);

    // Return a detailed error response
    return NextResponse.json(
      {
        error: "Failed to update recommendation",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
