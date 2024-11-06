import { NextResponse } from "next/server";
import dbClient from "../../../../dbConfig";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
    try {
        const { name, email, password } = await req.json();

        // Hash the password before storing
        const hashedPassword = await bcrypt.hash(password, 10);

        // Update user profile in the database
        const db = await dbClient.connectToDatabase();
        await db.collection("User").updateOne(
            { email },
            { $set: { name, password: hashedPassword } } // adjust this based on password hashing, if used
        );

        return NextResponse.json({ message: "Profile updated successfully!" });
    } catch (error) {
        return NextResponse.json({ message: "Failed to update profile" }, { status: 500 });
    }
}
