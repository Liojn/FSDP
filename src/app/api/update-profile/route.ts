import { NextResponse } from "next/server";
import dbClient from "../../../../dbConfig";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
    try {
        const { name, email, password, currentEmail } = await req.json();

        if (!currentEmail) {
            return NextResponse.json({ message: "Current email not provided" }, { status: 400 });
        }

        // Hash the password before storing
        const hashedPassword = await bcrypt.hash(password, 10);

        // Update user profile in the database
        const db = await dbClient.connectToDatabase();
        await db.collection("User").updateOne(
            { email: currentEmail },
            { $set: { name, email, password: hashedPassword } } // adjust this based on password hashing, if used
        );

        if (result.modifiedCount === 1) {
            return NextResponse.json({ message: "Profile updated successfully!" });
        } else {
            return NextResponse.json({ message: "Failed to update profile" }, { status: 500 });
        }
    } catch (error) {
        return NextResponse.json({ message: "Failed to update profile" }, { status: 500 });
    }
}
