// src/app/api/recommendation/data/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "dbConfig";

// The REST of the code connects to the database, 
// queries the "recommendations" collection for a specific userId, 
// and returns the user's recommendations; if no recommendations are found or an error occurs, 
// it returns an appropriate response.

export async function GET(request: NextRequest) {
  try {
    // Extract query params
    const userId = request.nextUrl.searchParams.get("userId") || "";

    if (!userId) {
      return NextResponse.json(
        { error: "Missing userId" },
        { status: 400 }
      );
    }

    // Connect to DB
    const db = await connectToDatabase.connectToDatabase();
    const recommendationsCollection = db.collection("recommendations");

    // Build our query without scopes
    const query: { userId: string } = { userId };

    // Find the document for the user
    const doc = await recommendationsCollection.findOne(query);

    // If no document found, return empty recommendations array
    if (!doc) {
      return NextResponse.json(
        { recommendations: [] },
        { status: 200 }
      );
    }

    // Return the recommendations array
    return NextResponse.json(
      { recommendations: doc.recommendations || [] },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/recommendation/data error:", error);
    return NextResponse.json(
      { error: "Failed to fetch recommendations" },
      { status: 500 }
    );
  }
}
