import { NextResponse } from "next/server";
import connectToDatabase from "@/../dbConfig";

export async function GET() {
  try {
    const db = await connectToDatabase.connectToDatabase();
    if (!db) {
      throw new Error("Database connection failed.");
    }

    // Fetch all badges from the Badges collection
    const badgesCollection = db.collection("Badges");
    const badges = await badgesCollection.find({})
      .project({
        _id: 1,
        title: 1,
        description: 1,
        category: 1,
        credits: 1, 
        status: 1,
      })
      .toArray();

    return NextResponse.json(badges, { status: 200 });
  } catch (error) {
    console.error("Error fetching badges:", error);
    return NextResponse.json({ error: "Failed to fetch badges" }, { status: 500 });
  }
}