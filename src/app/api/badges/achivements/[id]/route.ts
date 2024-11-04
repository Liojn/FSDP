import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/../dbConfig";
import { ObjectId } from "mongodb";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = params?.id;  // assuming id is the user_id you are passing
    if (!userId || userId.length !== 24) {
      return NextResponse.json({ error: "Invalid or missing user ID" }, { status: 400 });
    }

    const objectId = new ObjectId(userId);
    const db = await connectToDatabase();
    if (!db) {
      throw new Error("Database connection failed.");
    }

    // Query the UserBadges table to get 12 badges with specified fields
    const userBadgesCollection = db.collection("UserBadges");
    const userBadges = await userBadgesCollection.find({ user_id: objectId })
      .project({
        _id: 1,
        user_id: 1,
        badge_id: 1,
        progress: 1,
        isUnlocked: 1,
        dateUnlocked: 1
      })
      .limit(12)  // Limiting to 12 badges
      .toArray();

    return NextResponse.json(userBadges, { status: 200 });
  } catch (error) {
    console.error("Error fetching badges:", error);
    return NextResponse.json({ error: "Failed to fetch badges" }, { status: 500 });
  }
}
