import { NextResponse } from "next/server";

interface Threshold {
  id: string;
  category: string;
  metric: string;
  value: number;
  unit: string;
  createdAt: Date;
  updatedAt: Date;
}

// In-memory storage for thresholds (replace with database in production)
let thresholds: Threshold[] = [];

export async function GET() {
  return NextResponse.json({ thresholds });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { category, metric, value, unit } = body;

    if (!category || !metric || !value || !unit) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const newThreshold: Threshold = {
      id: Math.random().toString(36).substring(7),
      category,
      metric,
      value,
      unit,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    thresholds.push(newThreshold);

    return NextResponse.json({ threshold: newThreshold }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create threshold" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, value, unit } = body;

    const thresholdIndex = thresholds.findIndex((t) => t.id === id);
    if (thresholdIndex === -1) {
      return NextResponse.json(
        { error: "Threshold not found" },
        { status: 404 }
      );
    }

    thresholds[thresholdIndex] = {
      ...thresholds[thresholdIndex],
      value,
      unit,
      updatedAt: new Date(),
    };

    return NextResponse.json({ threshold: thresholds[thresholdIndex] });
  } catch {
    return NextResponse.json(
      { error: "Failed to update threshold" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Missing threshold ID" },
        { status: 400 }
      );
    }

    thresholds = thresholds.filter((t) => t.id !== id);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete threshold" },
      { status: 500 }
    );
  }
}
