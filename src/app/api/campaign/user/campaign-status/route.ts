import { NextRequest, NextResponse } from "next/server";
import { Collection } from "mongodb";
import dbConfig from "dbConfig";
import { Company, CampaignParticipant } from "@/app/campaign/types";

export async function GET(request: NextRequest) {
  try {
    console.log("Connecting to the database...");
    const db = await dbConfig.connectToDatabase();
    
    // Get user email from session or token
    const userEmail = request.headers.get("user-email");
    console.log("User email from headers:", userEmail);
    
    if (!userEmail) {
      console.log("No user email found in request headers.");
      return NextResponse.json(
        { hasJoined: false },
        { status: 200 }
      );
    }

    const companiesCollection: Collection<Company> = db.collection("companies");
    const participantsCollection: Collection<CampaignParticipant> = db.collection("campaign_participants");
    const campaignsCollection = db.collection("campaigns");

    // Find active campaign
    console.log("Searching for active campaign...");
    const activeCampaign = await campaignsCollection.findOne({ status: "Active" });
    console.log("Active campaign found:", activeCampaign);
    if (!activeCampaign) {
      console.log("No active campaign found.");
      return NextResponse.json(
        { hasJoined: false },
        { status: 200 }
      );
    }

    // Find company by user email
    console.log("Searching for company with email:", userEmail);
    const company = await companiesCollection.findOne({
      email: { $regex: new RegExp(`^${userEmail}$`, 'i') }
    });
    console.log("Company found:", company);

    if (!company) {
      console.log("No company found for the given email.");
      return NextResponse.json(
        { hasJoined: false },
        { status: 200 }
      );
    }

    // Check if company is participating in active campaign
    console.log("Checking if company is participating in the active campaign...");
    const participation = await participantsCollection.findOne({
      companyId: company._id.toString(),
      campaignId: activeCampaign._id.toString()
    });
    console.log("Participation found:", participation);

    if (!participation) {
      console.log("Company is not participating in the active campaign.");
      return NextResponse.json(
        { hasJoined: false },
        { status: 200 }
      );
    }

    // Return company and participation details
    console.log("Company is participating. Returning participation details...");
    return NextResponse.json({
      hasJoined: true,
      company: {
        name: company.name,
        size: company.size,
        email: company.email,
        contactPerson: company.contactPerson,
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
