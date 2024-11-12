import { NextRequest, NextResponse } from "next/server";
import dbConfig from "dbConfig";

// Correctly define the HTTP method handlers using function declarations

// Add OPTIONS handler for CORS support
export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}

export async function GET() {
  console.log("GET request received");
  try {
    const db = await dbConfig.connectToDatabase();
    const thresholds = await db.collection("thresholds").find().toArray();
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
    const { scope, description, value, unit } = body;

    if (!scope || !value || !unit) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const newThreshold = {
      id: Math.random().toString(36).substring(7),
      scope,
      description: description || getDefaultDescription(scope),
      value,
      unit,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const db = await dbConfig.connectToDatabase();
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

    const { id, value, unit } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Missing threshold ID" },
        { status: 400 }
      );
    }

    const db = await dbConfig.connectToDatabase();

    // First check if the document exists
    const existingThreshold = await db.collection("thresholds").findOne({ id });

    if (!existingThreshold) {
      return NextResponse.json(
        { error: "Threshold not found" },
        { status: 404 }
      );
    }

    const result = await db.collection("thresholds").findOneAndUpdate(
      { id },
      {
        $set: {
          value,
          unit,
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" }
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
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Missing threshold ID" },
        { status: 400 }
      );
    }

    const db = await dbConfig.connectToDatabase();
    const result = await db.collection("thresholds").deleteOne({ id });

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
