import { NextResponse } from "next/server";
import dbClient from "../../../../dbConfig";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {

    try {
        // Connect to MongoDB
        const body = await req.json();

        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
        }
        
        const db = await dbClient.connectToDatabase();

        const user = await db.collection("User").findOne({ email });

        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        const matchingPassword = await bcrypt.compare(password, user.password);
        if (!matchingPassword) {
            return NextResponse.json({ message: 'Invalid credentials' }, { status: 404 });
        }

        const token = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_SECRET_KEY || "your-jwt-secret-key",
            { expiresIn: "1h" }
        )

        return NextResponse.json({ token }, { status: 200 });
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
        }
}

// Handle GET request (if necessary to avoid 405 errors)
export async function GET() {
    return NextResponse.json({ message: 'API is up and running!' }, { status: 200 });
}