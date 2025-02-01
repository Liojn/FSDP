import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import connectToDatabase from "@/../dbConfig";

export async function POST(request: NextRequest) {
  try {
    const db = await connectToDatabase.connectToDatabase();
    if (!db) {
      throw new Error("Database connection failed");
    }

    const { userId, badgeId } = await request.json();
    if (!userId || !badgeId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const objectId = new ObjectId(userId);
    const badgeObjectId = new ObjectId(badgeId);

    // Get the badge details
    const userBadge = await db.collection("UserBadges").findOne({
      user_id: objectId,
      badge_id: badgeObjectId,
      isUnlocked: true,
      creditsAwarded: false
    });

    if (!userBadge) {
      return NextResponse.json({ error: "Badge not found or already claimed" }, { status: 404 });
    }

    // Start a session for the transaction
    const session = db.client.startSession();

    try {
      await session.withTransaction(async () => {
        // Update the badge to mark credits as awarded
        await db.collection("UserBadges").updateOne(
          {
            user_id: objectId,
            badge_id: badgeObjectId
          },
          {
            $set: { creditsAwarded: true }
          },
          { session }
        );

        // Update the user's credit balance
        await db.collection("User").updateOne(
          { _id: objectId },
          { $inc: { carbonCredits: userBadge.credits } },
          { session }
        );
      });

      console.log("Credits claimed successfully");
      console.log("Credits earned:", userBadge.credits);
      
      await session.endSession();

      return NextResponse.json({
      message: "Credits claimed successfully",
      creditsEarned: userBadge.credits, // Changed from credits
      newStoreCurrency: userBadge.credits // Add this to match client expectation
    }, { status: 200 });

    } catch (error) {
      await session.endSession();
      throw error;
    }

  } catch (error) {
    console.error("Error claiming credits:", error);
    return NextResponse.json({ error: "Failed to claim credits" }, { status: 500 });
  }
}