import { NextRequest, NextResponse } from "next/server";
import { Collection, ObjectId } from "mongodb";
import dbConfig from "dbConfig";
import { Company, CampaignParticipant } from "../../../campaign/types";
import { companyFormSchema } from "../../../campaign/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { companyInfo } = body;

    // Validate company info
    const companyValidation = companyFormSchema.safeParse(companyInfo);
    if (!companyValidation.success) {
      return NextResponse.json(
        { message: "Invalid company information", errors: companyValidation.error.flatten() },
        { status: 400 }
      );
    }

    const db = await dbConfig.connectToDatabase();
    const campaignsCollection = db.collection("campaigns");
    const companiesCollection: Collection<Company> = db.collection("companies");
    const participantsCollection: Collection<CampaignParticipant> = db.collection("campaign_participants");

    // Check for active campaign
    const campaign = await campaignsCollection.findOne({ status: "Active" });
    if (!campaign) {
      return NextResponse.json(
        { message: "No active campaign found" },
        { status: 404 }
      );
    }

    // Check for existing company or create new one
    let company = await companiesCollection.findOne({ email: companyInfo.email });
    if (!company) {
      const result = await companiesCollection.insertOne({
        ...companyInfo,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      company = {
        _id: result.insertedId,
        ...companyInfo,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }

    // Check for existing participation
    const existingParticipation = await participantsCollection.findOne({
      campaignId: campaign._id?.toString(),
      companyId: company?._id?.toString() || ''
    });

    if (existingParticipation) {
      return NextResponse.json(
        { message: "Company already joined this campaign" },
        { status: 400 }
      );
    }

    // Create new participation with all required fields
    const newParticipation: CampaignParticipant = {
      _id: new ObjectId(), // Explicitly create an _id
      campaignId: campaign._id?.toString() || '',
      companyId: company?._id?.toString() || '',
      joinedAt: new Date(),
      currentProgress: 0,
      lastUpdated: new Date()
    };

    await participantsCollection.insertOne(newParticipation);

    return NextResponse.json(
      { 
        message: "Successfully joined the campaign",
        company: {
          ...companyInfo,
          _id: company ? company._id?.toString() : '',
          createdAt: company ? company.createdAt : new Date(),
          updatedAt: company ? company.updatedAt : new Date()
        },
        participation: {
          _id: newParticipation._id ? newParticipation._id.toString() : '',
          joinedAt: newParticipation.joinedAt,
          currentProgress: newParticipation.currentProgress
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Campaign join error:", error);
    return NextResponse.json(
      { error: "Failed to process join request" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { participationId, progress } = body;

    if (!participationId || typeof progress !== 'number') {
      return NextResponse.json(
        { message: "Invalid request parameters" },
        { status: 400 }
      );
    }

    const db = await dbConfig.connectToDatabase();
    const participantsCollection: Collection<CampaignParticipant> = db.collection("campaign_participants");
    const campaignsCollection = db.collection("campaigns");

    const participation = await participantsCollection.findOne({
      _id: new ObjectId(participationId)
    });

    if (!participation) {
      return NextResponse.json(
        { message: "Participation record not found" },
        { status: 404 }
      );
    }

    // Ensure participation has all required fields
    if (!participation.joinedAt || !participation.campaignId) {
      console.error("Invalid participation record:", participation);
      return NextResponse.json(
        { message: "Invalid participation record structure" },
        { status: 500 }
      );
    }

    // Update participation progress
    await participantsCollection.updateOne(
      { _id: new ObjectId(participationId) },
      {
        $set: {
          currentProgress: progress,
          lastUpdated: new Date()
        }
      }
    );

    // Update campaign total progress
    const allParticipants = await participantsCollection
      .find({ campaignId: participation.campaignId })
      .toArray();

    const totalProgress = allParticipants.reduce(
      (sum, p) => sum + (p.currentProgress || 0),
      0
    );

    await campaignsCollection.updateOne(
      { _id: new ObjectId(participation.campaignId) },
      { $set: { totalReduction: totalProgress } }
    );

    return NextResponse.json({
      message: "Progress updated successfully",
      currentProgress: progress,
      totalProgress
    });
  } catch (error) {
    console.error("Error updating progress:", error);
    return NextResponse.json(
      { message: "Error updating progress" },
      { status: 500 }
    );
  }
}