import { NextResponse } from 'next/server';
import connectToDatabase from "dbConfig";

export async function POST(req: Request) {
  try {
    // Connect to the database
    const db = await connectToDatabase.connectToDatabase();

    // Retrieve userName from headers
    const userName = req.headers.get('userName');
    if (!userName) {
      return NextResponse.json({ error: 'Missing userName in headers' }, { status: 400 });
    }

    // Fetch the user to get company_id
    const user = await db.collection('User').findOne({ name: userName });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const companyId = user._id;

    // Fetch all records from WTEData using company_id
    const wteData = await db.collection('WTEData').find({ company_id: companyId }).toArray();

    // Return the fetched data as a JSON response
    return NextResponse.json({ wteData }, { status: 200 });
  } catch (error) {
    console.error("Error fetching data:", error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
