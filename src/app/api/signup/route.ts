import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbClient from "../../../../dbConfig"

export async function POST (req: Request ){

    
    try {

        const body = await req.json();

        const { name, email, password, firstYearGoal } = body;

        if (!name || !email || !password || !firstYearGoal) {
            return NextResponse.json({ message: 'Missing required fields.' }, { status: 400 });
        }
        const db = await dbClient.connectToDatabase();

        const existingUser = await db.collection("User").findOne({ email });

        if(existingUser) {
            return NextResponse.json({ message: 'User already exists' }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Get the current year
        const currentYear = new Date().getFullYear();

        await db.collection("User").insertOne({
            name,
            email,
            password: hashedPassword,
            firstYearGoal,
            emissionGoal: [
                {
                    year: currentYear,
                    target: 0, // Preset target to 0
                }
            ],
        })

        return NextResponse.json({ message: 'User created successfully' }, { status: 201 });
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        catch (error){
            return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
        }
}