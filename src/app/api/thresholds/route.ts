/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import dbConfig from "dbConfig";

// Ensure unique constraints on userId and scope
async function ensureUniqueIndex(db: any) {
  await db.collection("thresholds").createIndex(
    { userId: 1, scope: 1 },
    { unique: true }
  );
}

// Add OPTIONS handler for CORS support
export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}

export async function GET(req: NextRequest) {
  console.log("GET request received");
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json(
      { error: "Missing userId parameter" },
      { status: 400 }
    );
  }

  try {
    const db = await dbConfig.connectToDatabase();
    await ensureUniqueIndex(db);
    const thresholds = await db
      .collection("thresholds")
      .find({ userId })
      .toArray();
    return NextResponse.json({ thresholds });
  } catch (error: unknown) {
    console.error("Failed to fetch thresholds:", error);
    return NextResponse.json(
      { error: "Failed to fetch thresholds" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  console.log("POST request received");
  try {
    const body = await req.json();
    const { userId, scope, description, value, unit } = body;

    if (!userId || !scope || !value || !unit) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const newThreshold = {
      userId,
      scope,
      description: description || getDefaultDescription(scope),
      value,
      unit,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const db = await dbConfig.connectToDatabase();
    await ensureUniqueIndex(db);

    // Insert the new threshold or throw error if duplicate
    await db.collection("thresholds").insertOne(newThreshold);

    return NextResponse.json({ threshold: newThreshold }, { status: 201 });
  } catch (error: unknown) {
    console.error("Failed to create threshold:", error);
    return NextResponse.json(
      { error: "Failed to create threshold" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  console.log("PUT request received");
  try {
    const body = await req.json();
    console.log("Request body:", body);

    const { userId, scope, value, unit } = body;

    if (!userId || !scope) {
      return NextResponse.json(
        { error: "Missing userId or scope" },
        { status: 400 }
      );
    }

    const db = await dbConfig.connectToDatabase();
    await ensureUniqueIndex(db);

    // Use upsert to insert a new document if one doesn't exist
    const result = await db.collection("thresholds").findOneAndUpdate(
      { userId, scope },
      {
        $set: {
          value,
          unit,
          updatedAt: new Date(),
        },
        $setOnInsert: {
          userId,
          scope,
          description: getDefaultDescription(scope),
          createdAt: new Date(),
        },
      },
      { returnDocument: "after", upsert: true }
    );

    return NextResponse.json({ threshold: result.value });
  } catch (error: unknown) {
    console.error("Failed to update threshold:", error);
    return NextResponse.json(
      { error: "Failed to update threshold" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  console.log("DELETE request received");
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const scope = searchParams.get("scope");

    if (!userId || !scope) {
      return NextResponse.json(
        { error: "Missing userId or scope" },
        { status: 400 }
      );
    }

    const db = await dbConfig.connectToDatabase();
    const result = await db.collection("thresholds").deleteOne({ userId, scope });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Threshold not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Failed to delete threshold:", error);
    return NextResponse.json(
      { error: "Failed to delete threshold" },
      { status: 500 }
    );
  }
}

// Helper function remains the same
function getDefaultDescription(scope: string): string {
  switch (scope) {
    case "Scope 1":
      return "Direct emissions from owned or controlled sources";
    case "Scope 2":
      return "Indirect emissions from purchased electricity, steam, heating, and cooling";
    case "Scope 3":
      return "All other indirect emissions in the value chain";
    default:
      return "";
  }
}
