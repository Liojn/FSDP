import { NextResponse } from 'next/server';
import { Db, ObjectId } from 'mongodb';
import connectToDatabase from "dbConfig";

interface WTEDataEntry {
  _id: ObjectId;
  company_id: ObjectId;
  status: string;
  processed: boolean;
  carbon_credits: number;
}

interface User {
  _id: ObjectId;
  name: string;
  carbonCredits: number;
}

export async function POST(req: Request) {
  try {
    const db: Db = await connectToDatabase.connectToDatabase();

    const userName = req.headers.get('userName');
    if (!userName) {
      return NextResponse.json({ error: 'Missing userName in headers' }, { status: 400 });
    }

    const user: User | null = await db.collection<User>('User').findOne({ name: userName });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const companyId = user._id;

    // Find all unprocessed WTEData entries with status 'complete'
    const unprocessedCompleteWTEData: WTEDataEntry[] = await db.collection<WTEDataEntry>('WTEData').find({
      company_id: companyId,
      status: 'Complete',
      processed: false
    }).toArray();

    if (unprocessedCompleteWTEData.length > 0) {
      const totalCredits: number = unprocessedCompleteWTEData.reduce((sum: number, entry: WTEDataEntry) => 
        sum + (entry.carbon_credits || 0), 0
      );

      // Update user's carbonCredits
      await db.collection<User>('User').updateOne(
        { _id: companyId },
        { $inc: { carbonCredits: totalCredits } }
      );

      // Mark entries as processed
      const entryIds = unprocessedCompleteWTEData.map(entry => entry._id);
      await db.collection<WTEDataEntry>('WTEData').updateMany(
        { _id: { $in: entryIds } },
        { $set: { processed: true } }
      );
    }

    // Fetch all WTEData entries for the company
    const wteData: WTEDataEntry[] = await db.collection<WTEDataEntry>('WTEData').find({ company_id: companyId }).toArray();

    return NextResponse.json({ wteData }, { status: 200 });
  } catch (error) {
    console.error("Error processing data:", error);
    return NextResponse.json({ error: 'Failed to process data' }, { status: 500 });
  }
}
