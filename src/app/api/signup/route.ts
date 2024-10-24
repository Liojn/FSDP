import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbClient from "../../../../dbConfig"

export async function POST (req: Request ){

    
    try {

        const body = await req.json();

        const { name, email, password } = body;

        if (!name || !email || !password) {
            return NextResponse.json({ message: 'Missing required fields.' }, { status: 400 });
        }
        const db = await dbClient.connectToDatabase();

        const existingUser = await db.collection("User").findOne({ email });

        if(existingUser) {
            return NextResponse.json({ message: 'User already exists' }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await db.collection("User").insertOne({
            name,
            email,
            password: hashedPassword,
        })

        return NextResponse.json({ message: 'User created successfully' }, { status: 201 });
        }
        catch (error){
            return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
        }
}