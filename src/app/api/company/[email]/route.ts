import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/../dbConfig";

export async function GET(request: NextRequest, { params }: { params: { email: string } }) {
  try {
    const email = params?.email;

    const db = await connectToDatabase.connectToDatabase();
    if (!db) {
      throw new Error("Database connection failed.");
    }
    const userCollection = db.collection("User");
    const user = await userCollection.findOne({ email: email }, {
      projection: {
        _id: 1,
        name: 1,
        email: 1,
        carbonCredits: 1,
        totalPurchase:1,
        totalSpent:1
      }
    });

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
  }
}