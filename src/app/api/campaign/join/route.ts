import { NextRequest, NextResponse } from "next/server";
import { Collection, ObjectId } from "mongodb";
import dbConfig from "dbConfig";
import { 
  Company, 
  CampaignParticipant, 
  IndustryStandard, 
  CompanySize,
  CompanyFormValues
} from "../../../campaign/types";
import { companyFormSchema, participationFormSchema } from "@/app/campaign/types";

interface JoinRequestBody {
  companyInfo: CompanyFormValues;
  targetReduction: number;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as JoinRequestBody;
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
    const industryStandardsCollection: Collection<IndustryStandard> = db.collection("industry_standards");

    // Get active campaign
    const campaign = await campaignsCollection.findOne({ status: "Active" });
    if (!campaign) {
      return NextResponse.json(
        { message: "No active campaign found" },
        { status: 404 }
      );
    }

    // Get industry standards for validation
    const industryStandard = await industryStandardsCollection.findOne({
      industry: companyInfo.industry
    });

    if (!industryStandard) {
      return NextResponse.json(
        { message: "Industry standards not found" },
        { status: 400 }
      );
    }

    // Calculate size-based multiplier
    const sizeMultipliers: Record<CompanySize, number> = {
      Small: 1,
      Medium: 2,
      Large: 3
    };
    const multiplier = sizeMultipliers[companyInfo.size as CompanySize] * industryStandard.multiplier;

    // Calculate acceptable range
    const minReduction = industryStandard.minReduction * multiplier;
    const maxReduction = industryStandard.maxReduction * multiplier;

    // Validate target reduction against industry standards
    if (targetReduction < minReduction || targetReduction > maxReduction) {
      return NextResponse.json(
        {
          message: "Target reduction outside acceptable range",
          range: { min: minReduction, max: maxReduction }
        },
        { status: 400 }
      );
    }

    // Create or update company profile
    const existingCompany = await companiesCollection.findOne({
      email: companyInfo.email
    });

    let company: Company;

    if (!existingCompany) {
      // Create new company
      const newCompany: Omit<Company, '_id'> = {
        ...companyInfo,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      const result = await companiesCollection.insertOne(newCompany);
      company = {
        _id: result.insertedId,
        ...newCompany
      };
    } else {
      // Update existing company profile
      const updatedCompany: Company = {
        ...existingCompany,
        ...companyInfo,
        createdAt: existingCompany.createdAt,
        updatedAt: new Date()
      };
      await companiesCollection.updateOne(
        { _id: existingCompany._id },
        { $set: updatedCompany }
      );
      company = updatedCompany;
    }

    // Check if company is already participating in the campaign
    const existingParticipation = await participantsCollection.findOne({
      campaignId: campaign._id?.toString(),
      companyId: company._id?.toString()
    });

    if (existingParticipation) {
      return NextResponse.json(
        { message: "Company is already participating in this campaign" },
        { status: 400 }
      );
    }

    // Create new participation record
    const newParticipation: Omit<CampaignParticipant, '_id'> = {
      campaignId: campaign._id?.toString() || '',
      companyId: company._id?.toString() || '',
      targetReduction,
      currentProgress: 0,
      lastUpdated: new Date(),
      joinedAt: new Date()
    };

    const participationResult = await participantsCollection.insertOne(newParticipation);

    // Update campaign totals
    await campaignsCollection.updateOne(
      { _id: campaign._id },
      {
        $inc: {
          signeesCount: 1,
          totalReduction: targetReduction
        }
      }
    );

    return NextResponse.json(
      { 
        message: "Successfully joined the campaign",
        company: {
          ...companyInfo,
          _id: company._id?.toString(),
          createdAt: company.createdAt,
          updatedAt: company.updatedAt
        },
        participation: {
          ...newParticipation,
          _id: participationResult.insertedId.toString()
        }
      },
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
      return NextResponse.json(
        { message: "Participation record not found" },
        { status: 404 }
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
