import { NextRequest, NextResponse } from "next/server";
import { Collection, ObjectId } from "mongodb";
import dbConfig from "dbConfig";
import { Company, CampaignParticipant } from "../../../campaign/types";
import { companyFormSchema, participationFormSchema } from "../../../campaign/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { companyInfo, targetReduction } = body;

    // Validate company info
    const companyValidation = companyFormSchema.safeParse(companyInfo);
    if (!companyValidation.success) {
      return NextResponse.json(
        { message: "Invalid company information", errors: companyValidation.error.flatten() },
        { status: 400 }
      );
    }

    // Validate target reduction
    const targetValidation = participationFormSchema.safeParse({ targetReduction });
    if (!targetValidation.success) {
      return NextResponse.json(
        { message: "Invalid target reduction", errors: targetValidation.error.flatten() },
        { status: 400 }
      );
    }

    const db = await dbConfig.connectToDatabase();
    
    const campaignsCollection = db.collection("campaigns");
    const companiesCollection: Collection<Company> = db.collection("companies");
    const participantsCollection: Collection<CampaignParticipant> = db.collection("campaign_participants");

    // Get active campaign
    const campaign = await campaignsCollection.findOne({ status: "Active" });
    if (!campaign) {
      return NextResponse.json(
        { message: "No active campaign found" },
        { status: 404 }
      );
    }

    // Check if company name or email already exists
    const existingCompany = await companiesCollection.findOne({
      $or: [
        { name: { $regex: new RegExp(`^${companyInfo.name}$`, 'i') } },
        { email: { $regex: new RegExp(`^${companyInfo.email}$`, 'i') } }
      ]
    });

    if (existingCompany) {
      return NextResponse.json(
        { message: "Company with this name or email is already registered" },
        { status: 400 }
      );
    }

    // Create new company
    const newCompany: Omit<Company, '_id'> = {
      ...companyInfo,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const companyResult = await companiesCollection.insertOne(newCompany);
    const company: Company = {
      _id: companyResult.insertedId,
      ...newCompany
    };

    // Create campaign participant entry
    const newParticipant: Omit<CampaignParticipant, '_id'> = {
      campaignId: campaign._id.toString(),
      companyId: (company._id as ObjectId).toString(),
      targetReduction: targetReduction,
      currentProgress: 0,
      joinedAt: new Date(),
      lastUpdated: new Date()
    };
    await participantsCollection.insertOne(newParticipant);

    // Update campaign totals
    await campaignsCollection.updateOne(
      { _id: campaign._id },
      {
        $inc: {
          totalReduction: targetReduction,
          signeesCount: 1
        }
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

// Update participation progress
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { participationId, progress } = body;

    const db = await dbConfig.connectToDatabase();
    const participantsCollection: Collection<CampaignParticipant> = db.collection("campaign_participants");
    const campaignsCollection = db.collection("campaigns");

    const participation = await participantsCollection.findOne({
      _id: new ObjectId(participationId)
    });

    if (!participation) {
      console.error("Participation record not found.");
      return NextResponse.json(
        { message: "Participation record not found" },
        { status: 404 }
      );
    }

    // Add log for participation details
    console.log("Participation record found:", participation);

    // Ensure participation has 'joinedAt' property before accessing it
    if (!participation.joinedAt) {
      console.error("Missing 'joinedAt' property in participation record.");
      return NextResponse.json(
        { message: "'joinedAt' property missing in participation record" },
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
      (sum, p) => sum + (p._id?.toString() === participationId ? progress : p.currentProgress),
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


