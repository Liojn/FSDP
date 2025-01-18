// app/api/recommendation/add/route.ts

import { NextResponse } from "next/server";
import connectToDatabase from "dbConfig"; // Adjust the path as needed
import { TrackingRecommendation, CategoryType } from "@/types";
import { ObjectId } from "mongodb"; // Import ObjectId from MongoDB

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Destructure necessary fields from the request body
    const {
      userId,
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

    // Initialize the new recommendation with ObjectId-based IDs
    const newRecommendation: TrackingRecommendation = {
      id: new ObjectId().toHexString(), // Generate unique ID using ObjectId
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
      trackingImplementationSteps: implementationSteps.map((step: string) => ({
        id: new ObjectId().toHexString(), // Generate unique ID for each step
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
