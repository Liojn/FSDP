import { NextResponse } from "next/server";
import dbConfig from "dbConfig";

export async function GET() {
  try {
    const db = await dbConfig.connectToDatabase();
    const count = await db.collection("campaign_participants").countDocuments();
    return NextResponse.json({ count });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch count" }, { status: 500 });
  }
}