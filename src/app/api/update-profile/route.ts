import { NextResponse } from "next/server";
import dbClient from "../../../../dbConfig";

export async function POST(req: Request) {
    try {
        const { name, email, password } = await req.json();

        // Update user profile in the database
        const db = await dbClient.connectToDatabase();
        await db.collection("User").updateOne(
            { email },
            { $set: { name, password } } // adjust this based on password hashing, if used
        );

        return NextResponse.json({ message: "Profile updated successfully!" });
    } catch (error) {
        return NextResponse.json({ message: "Failed to update profile" }, { status: 500 });
    }
}
