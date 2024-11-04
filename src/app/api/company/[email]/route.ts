import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/../dbConfig";

export async function GET(request: NextRequest, { params }: { params: { email: string } }) {
  try {
    const email = params?.email;  // assuming id is the user_id you are passing

    const db = await connectToDatabase();
    if (!db) {
      throw new Error("Database connection failed.");
    }
    const userCollection = db.collection("User");
    const user = await userCollection.find({ email: email })
    .project({
        _id: 1,
        name: 1,
        email: 1,
        password: 1,
      }).toArray();

      return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
  }
}
