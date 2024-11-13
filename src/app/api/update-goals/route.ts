import { NextResponse } from "next/server";
import dbClient from "../../../../dbConfig";
import { ObjectId } from "mongodb";  // Import ObjectId from mongodb

export async function POST(req: Request) {
    try {
        const { mainGoals, userId } = await req.json();
        const db = await dbClient.connectToDatabase();
        const userCollection = db.collection("User");

        // Convert companyId (which is stored as string locally) to ObjectId
        const userObjectId = new ObjectId(userId);

        // Fetch user data
        const user = await userCollection.findOne({ _id: userObjectId });
        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        // Get current year
        const currentYear = new Date().getFullYear();

        // Check if current year goal exists
        const existingGoalIndex = user.emissionGoal.findIndex((goal: { year: number }) => goal.year === currentYear);

        // If the goal for the current year exists, update it
        if (existingGoalIndex !== -1) {
            // Update the target for the current year
            user.emissionGoal[existingGoalIndex].target = mainGoals;
        } else {
            // If no goal for the current year, create a new goal entry with the current year and the new target
            const lastYearGoal = user.emissionGoal[user.emissionGoal.length - 1]; // Last year's goal
            user.emissionGoal.push({
                year: currentYear,
                target: mainGoals || lastYearGoal.target, // Default to last year's target if no new target is provided
            });
        }

        // Update the user's emissionGoal array in the database
        await userCollection.updateOne(
            { _id: userObjectId },
            { $set: { emissionGoal: user.emissionGoal } } // Set the updated emissionGoal array
        );

        return NextResponse.json({ message: "Goals updated successfully!" });
    } catch (error) {
        console.error(error)
        return NextResponse.json({ message: "Failed to update goals" }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("userId");

        if (!userId) {
            return NextResponse.json({ message: "User ID is required" }, { status: 400 });
        }

        const db = await dbClient.connectToDatabase();
        const userCollection = db.collection("User");

        // Convert userId (stored as string) to ObjectId for MongoDB query
        const userObjectId = new ObjectId(userId);

        // Fetch the user document
        const user = await userCollection.findOne({ _id: userObjectId });
        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        // Check if emissionGoal array exists and has entries
        const emissionGoals = user.emissionGoal;
        if (!emissionGoals || emissionGoals.length === 0) {
            return NextResponse.json({ message: "No emission goals found for the user" }, { status: 404 });
        }

        // Get the last entry in the emissionGoal array
        const lastEmissionGoal = emissionGoals[emissionGoals.length - 1];

        return NextResponse.json({ lastEmissionGoal });
    } catch (error) {
        console.error("Error fetching last emission goal:", error);
        return NextResponse.json({ message: "Failed to retrieve emission goal" }, { status: 500 });
    }
}
