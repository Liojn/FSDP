import { NextResponse } from "next/server";
import { Collection, ObjectId, Document } from "mongodb";
import dbConfig from "dbConfig";
import { Campaign, Company, CampaignParticipant, Testimonial, IndustryStandard } from "../../campaign/types";

export async function GET() {
  try {
    const db = await dbConfig.connectToDatabase();
    
    // Get all required collections
    const campaignsCollection: Collection<Campaign> = db.collection("campaigns");
    const companiesCollection: Collection<Company> = db.collection("companies");
    const participantsCollection: Collection<CampaignParticipant> = db.collection("campaign_participants");
    const testimonialsCollection: Collection<Testimonial> = db.collection("testimonials");
    const industryStandardsCollection: Collection<IndustryStandard> = db.collection("industry_standards");

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
        totalReduction: 0,
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
        participants: [],
        testimonials: [],
        industryStandards: []
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
    
    const companies = await companiesCollection
      .find({ _id: { $in: companyIds } } as Document)
      .toArray();

    // Get approved testimonials
    const testimonials = await testimonialsCollection
      .find({ 
        campaignId: activeCampaign._id instanceof ObjectId 
          ? activeCampaign._id.toString() 
          : activeCampaign._id,
        approved: true 
      })
      .toArray();

    // Get all industry standards
    const industryStandards = await industryStandardsCollection
      .find({})
      .toArray();

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
      participants: participantData,
      testimonials: testimonials.map(t => ({
        ...t,
        _id: t._id instanceof ObjectId ? t._id.toString() : t._id
      })),
      industryStandards: industryStandards.map(is => ({
        ...is,
        _id: is._id instanceof ObjectId ? is._id.toString() : is._id
      }))
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

    // Set any currently active campaign to completed
    await campaignsCollection.updateMany(
      { status: "Active" },
      { $set: { status: "Completed" } }
    );

    // Create new campaign
    const newCampaign: Omit<Campaign, '_id'> = {
      name,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      status: "Active",
      totalReduction: 0,
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
    
    return NextResponse.json({
      ...newCampaign,
      _id: result.insertedId.toString()
    }, { status: 201 });
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

    const campaign = await campaignsCollection.findOne({
      _id: new ObjectId(campaignId)
    } as Document);

    if (!campaign) {
      return NextResponse.json(
        { message: "Campaign not found" },
        { status: 404 }
      );
    }

    // Calculate new milestone achievements
    const updatedMilestones = campaign.milestones.map(milestone => {
      const milestoneTarget = (campaign.targetReduction * milestone.percentage) / 100;
      if (!milestone.reached && progress >= milestoneTarget) {
        return { ...milestone, reached: true, reachedAt: new Date() };
      }
      return milestone;
    });

    // Update campaign progress and milestones
    await campaignsCollection.updateOne(
      { _id: new ObjectId(campaignId) } as Document,
      {
        $set: {
          totalReduction: progress,
          milestones: updatedMilestones
        }
      }
    );

    return NextResponse.json({ 
      message: "Progress updated successfully",
      milestones: updatedMilestones
    });
  } catch (error) {
    console.error("Error updating campaign progress:", error);
    return NextResponse.json(
      { message: "Error updating campaign progress" },
      { status: 500 }
    );
  }
}
