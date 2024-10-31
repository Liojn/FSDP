import { NextRequest, NextResponse } from "next/server";
import dbConfig from "dbConfig";
import { z } from "zod";

const companyInfoSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  industry: z.string().min(1, "Industry is required"),
  targetReduction: z.number().min(1, "Target reduction must be greater than 0"),
  contactPerson: z.string().min(1, "Contact person is required"),
  email: z.string().email("Invalid email address"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { companyInfo } = body;

    // Validate input
    const validationResult = companyInfoSchema.safeParse(companyInfo);
    if (!validationResult.success) {
      return NextResponse.json(
        { message: "Invalid input", errors: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const db = await dbConfig.connectToDatabase();
    
    const campaignsCollection = db.collection("campaigns");
    const signeesCollection = db.collection("signees");

    const campaign = await campaignsCollection.findOne();

    if (!campaign) {
      return NextResponse.json(
        { message: "Campaign not found" },
        { status: 404 }
      );
    }

    const newSignee = {
      campaignId: campaign._id,
      ...companyInfo,
      joinedAt: new Date(),
    };

    await signeesCollection.insertOne(newSignee);

    await campaignsCollection.updateOne(
      { _id: campaign._id },
      {
        $inc: {
          totalReduction: companyInfo.targetReduction,
          signeesCount: 1,
        },
      }
    );

    return NextResponse.json(
      { message: "Successfully joined the campaign" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error joining campaign:", error);
    return NextResponse.json(
      { message: "Error joining campaign" },
      { status: 500 }
    );
  }
}