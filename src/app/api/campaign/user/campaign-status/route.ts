import { NextRequest, NextResponse } from "next/server";
import { Collection } from "mongodb";
import dbConfig from "dbConfig";
import { Company, CampaignParticipant } from "@/app/campaign/types";

export async function GET(request: NextRequest) {
  try {
    const db = await dbConfig.connectToDatabase();
    
    // Get user email from session or token
    const userEmail = request.headers.get("user-email");
    
    if (!userEmail) {
      return NextResponse.json(
        { hasJoined: false },
        { status: 200 }
      );
    }

    const companiesCollection: Collection<Company> = db.collection("companies");
    const participantsCollection: Collection<CampaignParticipant> = db.collection("campaign_participants");
    const campaignsCollection = db.collection("campaigns");

    // Find active campaign
    const activeCampaign = await campaignsCollection.findOne({ status: "Active" });
    if (!activeCampaign) {
      return NextResponse.json(
        { hasJoined: false },
        { status: 200 }
      );
    }

    // Find company by user email
    const company = await companiesCollection.findOne({
      email: { $regex: new RegExp(`^${userEmail}$`, 'i') }
    });

    if (!company) {
      return NextResponse.json(
        { hasJoined: false },
        { status: 200 }
      );
    }

    // Check if company is participating in active campaign
    const participation = await participantsCollection.findOne({
      companyId: company._id.toString(),
      campaignId: activeCampaign._id.toString()
    });

    if (!participation) {
      return NextResponse.json(
        { hasJoined: false },
        { status: 200 }
      );
    }

    // Return company and participation details
    return NextResponse.json({
      hasJoined: true,
      company: {
        name: company.name,
        size: company.size,
        email: company.email,
        contactPerson: company.contactPerson,
        targetReduction: participation.targetReduction,
        currentProgress: participation.currentProgress,
        joinedAt: participation.joinedAt
      }
    });

  } catch (error) {
    console.error("Error checking campaign status:", error);
    return NextResponse.json(
      { message: "Error checking campaign status" },
      { status: 500 }
    );
  }
}
