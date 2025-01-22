// api/campaign/route.ts
import { NextResponse } from "next/server";
import { Collection, ObjectId } from "mongodb";
import dbConfig from "dbConfig";
import { Campaign, User, CampaignAPIResponse } from "@/types";

/**
 * GET Handler: Fetch active campaign and current user data.
 * Expects a 'userId' query parameter.
 */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");

    if (!userId || !ObjectId.isValid(userId)) {
      return NextResponse.json(
        { message: "Invalid or missing userId parameter" },
        { status: 400 }
      );
    }

    const db = await dbConfig.connectToDatabase();
    const campaignsCollection: Collection<Campaign> = db.collection("campaigns");
    const usersCollection: Collection<User> = db.collection("User"); // Ensure your users collection is named correctly

    // Fetch active campaign
    const activeCampaign = await campaignsCollection.findOne({ status: "Active" });

    if (!activeCampaign) {
      // Create a default campaign if none exists
      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1); // One month campaign

      const defaultCampaign: Omit<Campaign, "_id"> = {
        name: `Campaign ${startDate.toLocaleString("default", {
          month: "long",
          year: "numeric",
        })}`,
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
          { percentage: 100, reached: false },
        ],
      };

      const result = await campaignsCollection.insertOne(defaultCampaign);
      const createdCampaign: Campaign = {
        ...defaultCampaign,
        _id: result.insertedId.toString(),
      };

      // Fetch user data
      const user = await usersCollection.findOne({ _id: new ObjectId(userId) });

      if (!user) {
        return NextResponse.json(
          { message: "User not found" },
          { status: 404 }
        );
      }

      const response: CampaignAPIResponse = {
        campaign: createdCampaign,
        user: {
          ...user,
          _id: user._id.toString(),
        },
      };

      return NextResponse.json(response, { status: 200 });
    }

    // Fetch user data
    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    const response: CampaignAPIResponse = {
      campaign: {
        ...activeCampaign,
        _id: activeCampaign._id.toString(),
      },
      user: {
        ...user,
        _id: user._id.toString(),
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Error fetching campaign data:", error);
    return NextResponse.json({ message: "Error fetching campaign data" }, { status: 500 });
  }
}

/**
 * POST Handler: Create a new campaign.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, startDate, endDate, targetReduction } = body;

    const db = await dbConfig.connectToDatabase();
    const campaignsCollection: Collection<Campaign> = db.collection("campaigns");

    const newCampaign: Omit<Campaign, "_id"> = {
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
        { percentage: 100, reached: false },
      ],
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

/**
 * PATCH Handler: Update campaign progress.
 */
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { campaignId, progress } = body;

    if (!campaignId || !ObjectId.isValid(campaignId)) {
      return NextResponse.json(
        { message: "Invalid or missing campaignId" },
        { status: 400 }
      );
    }

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

    const updatedTotalReduction = (campaign.currentProgress || 0) + (progress || 0);

    // Update totalReduction and milestones
    const updatedMilestones = campaign.milestones.map((milestone) => {
      if (
        !milestone.reached &&
        updatedTotalReduction >= campaign.targetReduction * (milestone.percentage / 100)
      ) {
        return { ...milestone, reached: true, reachedAt: new Date() };
      }
      return milestone;
    });

    await campaignsCollection.updateOne(
      { _id: campaignObjectId },
      {
        $set: {
          currentProgress: updatedTotalReduction,
          milestones: updatedMilestones,
        },
      }
    );

    const updatedCampaign = await campaignsCollection.findOne({ _id: campaignObjectId });

    return NextResponse.json(
      { ...updatedCampaign, _id: updatedCampaign?._id.toString() },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating campaign progress:", error);
    return NextResponse.json(
      { message: "Error updating campaign progress" },
      { status: 500 }
    );
  }
}
