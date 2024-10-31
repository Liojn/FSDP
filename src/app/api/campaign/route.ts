// app/api/campaign/route.ts
import { NextResponse } from "next/server";
import { Collection, ObjectId } from "mongodb";
import dbConfig from "dbConfig";

export interface Campaign {
  _id: ObjectId;
  totalReduction: number;
  targetReduction: number;
  signeesCount: number;
}

export interface Signee {
  _id: ObjectId;
  campaignId: ObjectId;
  companyName: string;
  industry: string;
  targetReduction: number;
  contactPerson: string;
  email: string;
  joinedAt: Date;
}

export async function GET() {
  try {
    const db = await dbConfig.connectToDatabase();
    
    const campaignsCollection: Collection<Campaign> = db.collection("campaigns");
    const signeesCollection: Collection<Signee> = db.collection("signees");

    const campaign = await campaignsCollection.findOne();

    if (!campaign) {
      return NextResponse.json(
        { message: "Campaign not found" },
        { status: 404 }
      );
    }

    const signees = await signeesCollection
      .find({ campaignId: campaign._id })
      .sort({ joinedAt: -1 })
      .toArray();

    // Return data and close connection in case of success
    return NextResponse.json({
      totalReduction: campaign.totalReduction,
      targetReduction: campaign.targetReduction,
      signees: signees.map((signee) => ({
        companyName: signee.companyName,
        industry: signee.industry,
        reduction: signee.targetReduction,
        joinedAt: signee.joinedAt,
      })),
    });
  } catch (error) {
    console.error("Error fetching campaign data:", error);
    return NextResponse.json(
      { message: "Error fetching campaign data" },
      { status: 500 }
    );
  }
}
