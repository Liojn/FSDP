import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/../dbConfig";

export async function POST(
  request: NextRequest, 
  { params }: { params: { email: string } }
) {
  try {
    const email = params.email;
    const { carbonCredits, totalPurchases, totalSpent } = await request.json();

    const db = await connectToDatabase.connectToDatabase();
    if (!db) {
      throw new Error("Database connection failed.");
    }

    const userCollection = db.collection("User");
    const result = await userCollection.updateOne(
      { email: email },
      { 
        $set: { 
          carbonCredits: carbonCredits,
          totalPurchase: totalPurchases,
          totalSpent: totalSpent 
        } 
      }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json({ error: "User not found or data not updated" }, { status: 404 });
    }

    return NextResponse.json({ 
      message: "Credits and purchase metrics updated successfully", 
      carbonCredits, 
      totalPurchases, 
      totalSpent 
    }, { status: 200 });
  } catch (error) {
    console.error("Error updating user credits and purchase metrics:", error);
    return NextResponse.json({ error: "Failed to update credits and metrics" }, { status: 500 });
  }
}