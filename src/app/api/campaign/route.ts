import { NextResponse } from "next/server";
import { Collection, ObjectId,  Filter } from "mongodb";
import dbConfig from "dbConfig";
import { Campaign, Company, CampaignParticipant } from "../../campaign/types";
// api/campaign/route.ts
export async function GET() {
  try {
    const db = await dbConfig.connectToDatabase();
    
    // Get all required collections
    const campaignsCollection: Collection<Campaign> = db.collection("campaigns");
    const companiesCollection: Collection<Company> = db.collection("companies");
    const participantsCollection: Collection<CampaignParticipant> = db.collection("campaign_participants");

    // Get active campaign
    const activeCampaign = await campaignsCollection.findOne({ status: "Active" });

    // If no active campaign exists, create a new one
    if (!activeCampaign) {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1); // One month campaign

      const defaultCampaign: Omit<Campaign, '_id'> = {
        name: `Campaign ${startDate.toLocaleString('default', { month: 'long', year: 'numeric' })}`,
        startDate,
        endDate,
        status: "Active",
        currentProgress: 0,
        targetReduction: 1000000, // 1 million tons as target
        signeesCount: 0,
        milestones: [
          { percentage: 25, reached: false },
          { percentage: 50, reached: false },
          { percentage: 75, reached: false },
          { percentage: 100, reached: false }
        ]
      };

      const result = await campaignsCollection.insertOne(defaultCampaign);
      
      // Return empty campaign data with default campaign
      return NextResponse.json({
        campaign: { ...defaultCampaign, _id: result.insertedId.toString() },
        participants: []
      });
    }

    // Get campaign participants
    const participants = await participantsCollection
      .find({ 
        campaignId: activeCampaign._id instanceof ObjectId 
          ? activeCampaign._id.toString() 
          : activeCampaign._id 
      })
      .toArray();

    // Get companies for all participants
    const companyIds = participants.map(p => 
      typeof p.companyId === 'string' ? new ObjectId(p.companyId) : p.companyId
    );
    
    const query: Filter<Company> = { _id: { $in: companyIds } };
    const companies = await companiesCollection.find(query).toArray();

    // Combine participant and company data
    const participantData = participants.map(participant => ({
      company: companies.find(c => 
        (c._id instanceof ObjectId ? c._id.toString() : c._id) === participant.companyId
      ),
      participation: participant
    }));

    // Return complete campaign data
    return NextResponse.json({
      campaign: {
        ...activeCampaign,
        _id: activeCampaign._id instanceof ObjectId 
          ? activeCampaign._id.toString() 
          : activeCampaign._id
      },
      participants: participantData
    });
  } catch (error) {
    console.error("Error fetching campaign data:", error);
    return NextResponse.json(
      { message: "Error fetching campaign data" },
      { status: 500 }
    );
  }
}

// Create a new campaign
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, startDate, endDate, targetReduction } = body;

    const db = await dbConfig.connectToDatabase();
    const campaignsCollection: Collection<Campaign> = db.collection("campaigns");

    const newCampaign: Omit<Campaign, '_id'> = {
      name,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      status: "Active",
      currentProgress: 0,
      targetReduction,
      signeesCount: 0,
      milestones: [
        { percentage: 25, reached: false },
        { percentage: 50, reached: false },
        { percentage: 75, reached: false },
        { percentage: 100, reached: false }
      ]
    };

    const result = await campaignsCollection.insertOne(newCampaign);

    return NextResponse.json(
      { ...newCampaign, _id: result.insertedId.toString() },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating campaign:", error);
    return NextResponse.json(
      { message: "Error creating campaign" },
      { status: 500 }
    );
  }
}

// Update campaign progress
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { campaignId, progress } = body;

    const db = await dbConfig.connectToDatabase();
    const campaignsCollection: Collection<Campaign> = db.collection("campaigns");

    const campaignObjectId = new ObjectId(campaignId);
    const campaign = await campaignsCollection.findOne({ _id: campaignObjectId });

    if (!campaign) {
      return NextResponse.json(
        { message: "Campaign not found" },
        { status: 404 }
      );
    }

    const updatedTotalReduction = campaign.currentProgress + progress;

    // Update totalReduction and milestones
    const updatedMilestones = campaign.milestones.map((milestone) => {
      if (
        !milestone.reached &&
        updatedTotalReduction >=
          campaign.targetReduction * (milestone.percentage / 100)
      ) {
        return { ...milestone, reached: true, reachedAt: new Date() };
      }
      return milestone;
    });

    await campaignsCollection.updateOne(
      { _id: campaignObjectId },
      {
        $set: {
          totalReduction: updatedTotalReduction,
          milestones: updatedMilestones,
        },
      }
    );

    const updatedCampaign = await campaignsCollection.findOne({
      _id: campaignObjectId,
    });

    return NextResponse.json(updatedCampaign, { status: 200 });
  } catch (error) {
    console.error("Error updating campaign progress:", error);
    return NextResponse.json(
      { message: "Error updating campaign progress" },
      { status: 500 }
    );
  }
}
