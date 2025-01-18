// app/api/recommendation/add/route.ts

import { NextResponse } from "next/server";
import connectToDatabase from "dbConfig"; // Adjust the path as needed
import { TrackingRecommendation, CategoryType } from "@/types";
import { v4 as uuidv4 } from "uuid"; // Import UUID function

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Destructure necessary fields from the request body
    const {
      userId, // Ensure userId is provided to associate the recommendation with a user
      title,
      description,
      scope,
      impact,
      category,
      estimatedEmissionReduction,
      priorityLevel,
      implementationSteps,
      difficulty,
      estimatedTimeframe,
    } = body;

    // Validate required fields
    if (
      !userId ||
      !title ||
      !description ||
      !scope ||
      !impact ||
      !category ||
      estimatedEmissionReduction === undefined ||
      !priorityLevel ||
      !difficulty ||
      !estimatedTimeframe
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Initialize the new recommendation
    const newRecommendation: TrackingRecommendation = {
      id: uuidv4(), // Generate a unique UUID for the recommendation ID
      title,
      description,
      scope,
      impact,
      category: category as CategoryType,
      estimatedEmissionReduction,
      priorityLevel,
      implementationSteps,
      status: "Not Started",
      difficulty,
      estimatedTimeframe,
      progress: 0,
      trackingImplementationSteps: implementationSteps.map((step: string, index: number) => ({
        id: `${uuidv4()}-${index}`, // Generate a unique UUID for each step
        step,
        complete: false,
      })),
      completedSteps: 0,
      notes: [],
    };

    // Connect to the database
    const db = await connectToDatabase.connectToDatabase();
    const recommendationsCollection = db.collection("recommendations");

    // Update the user's document by pushing the new recommendation into the recommendations array
    const updateResult = await recommendationsCollection.updateOne(
      { userId },
      { $push: { recommendations: newRecommendation } },
      { upsert: true }
    );

    if (updateResult.modifiedCount === 0 && updateResult.upsertedCount === 0) {
      return NextResponse.json(
        { error: "Failed to add recommendation" },
        { status: 500 }
      );
    }

    return NextResponse.json(newRecommendation, { status: 201 });
  } catch (error) {
    console.error("Error adding recommendation:", error);
    return NextResponse.json(
      { error: "Failed to add recommendation" },
      { status: 500 }
    );
  }
}
