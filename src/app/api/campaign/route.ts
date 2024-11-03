// app/api/campaign/route.ts
import { NextResponse } from "next/server";
import { Collection, ObjectId } from "mongodb";
import dbConfig from "dbConfig";

export interface Campaign {
  _id?: ObjectId;  // Make _id optional
  totalReduction: number;
  targetReduction: number;
  signeesCount: number;
}

export interface Signee {
  _id?: ObjectId;  // Make _id optional here too for consistency
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

    let campaign = await campaignsCollection.findOne();

    // If no campaign exists, create a default one
    if (!campaign) {
      const defaultCampaign: Campaign = {
        totalReduction: 0,
        targetReduction: 1000000, // 1 million tons as target
        signeesCount: 0,
      };

      const result = await campaignsCollection.insertOne(defaultCampaign);
      campaign = {
        _id: result.insertedId,
        ...defaultCampaign,
      };
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
