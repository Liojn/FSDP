import { NextResponse } from "next/server";
import dbClient from "../../../../dbConfig";

export async function POST(req: Request) {
    try {
        const { mainGoals, userId } = await req.json();

        // Update goals in the database
        const db = await dbClient.connectToDatabase();
        await db.collection("UserGoals").updateOne(
            { userId },
            { $set: { mainGoals } },
            { upsert: true } // create the document if it doesn't exist
        );

        return NextResponse.json({ message: "Goals updated successfully!" });
    } catch (error) {
        return NextResponse.json({ message: "Failed to update goals" }, { status: 500 });
    }
}
