// recommendation/data/[id]/route.ts
/* eslint-disable @typescript-eslint/no-unused-vars */
import { ObjectId } from 'mongodb';
import { MetricData, ResponseData} from "@/types";
import connectToDatabase from "dbConfig";
import { NextRequest, NextResponse } from 'next/server';

// This code defines API routes for fetching, updating, and deleting recommendations in a sustainability management system. 
// - The `GET` route retrieves a specific recommendation, combining it with metrics and weather data based on the given ID and optional scopes.
// - The `DELETE` route removes a recommendation associated with a specific user ID.
// - The `PUT` route updates a recommendation, with additional logic to update campaign progress if the status changes to "Completed".
// - Helper functions `fetchWeatherData` and `getMetrics` fetch additional data (e.g., weather and metrics) to enrich the recommendation data.
// - Metrics calculations incorporate data from multiple collections (e.g., Equipment, EmissionRates, Livestock, Crops, Waste), 
// calculating emissions and comparing energy consumption year-over-year.


export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log('GET Request Parameters:', {
    id: params.id,
    scopes: request.nextUrl.searchParams.get("scopes")
  });

  const { id } = params; // This is the recommendation ID
  const scopesParam = request.nextUrl.searchParams.get("scopes");
  const scopes = scopesParam ? scopesParam.split(",").filter(Boolean) : [];

  if (!ObjectId.isValid(id)) {
    console.warn(`Invalid Recommendation ID format: ${id}`);
    return NextResponse.json(
      { error: `Invalid Recommendation ID format: ${id}` },
      { status: 400 }
    );
  }

  try {
    console.log('Connecting to database...');
    const db = await connectToDatabase.connectToDatabase();
    console.log('Database connected successfully');

    console.log('Fetching metrics and weather data...');
    // Fetch metrics and weather data
    const [metrics, weatherData] = await Promise.all([
      getMetrics(id), // Ensure this function fetches metrics correctly
      fetchWeatherData(),
    ]);
    console.log('Metrics and weather data fetched:', { 
      metricsReceived: !!metrics,
      weatherDataReceived: !!weatherData 
    });

    console.log('Querying recommendations with scopes:', scopes);
    // Fetch the document containing the recommendation
    const recommendationsCollection = db.collection("recommendations");
    const doc = await recommendationsCollection.findOne({
      "recommendations.id": id,
      ...(scopes.length > 0 && { scopes: { $all: scopes } }),
    });

    if (!doc) {
      console.log('No document found containing the recommendation.');
      return NextResponse.json(
        { metrics, weatherData, error: "No recommendation found" },
        { status: 404 }
      );
    }

    // Extract the specific recommendation
    const singleRec = doc.recommendations.find(
      (r: { id: string }) => r.id === id
    );

    if (!singleRec) {
      console.log('Recommendation not found within the document.');
      return NextResponse.json(
        { metrics, weatherData, error: "Recommendation not found" },
        { status: 404 }
      );
    }

    // Combine metrics, weatherData, and the single recommendation
    const responseData = {
      metrics,
      weatherData,
      recommendation: singleRec, // Return only the specific recommendation
    };

    console.log('Sending response with data:', {
      hasMetrics: !!responseData.metrics,
      hasWeather: !!responseData.weatherData,
      hasRecommendation: !!responseData.recommendation
    });

    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    console.error("Error in GET request:", error);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params; // Recommendation ID
  let body: { userId: string };

  try {
    body = await req.json();
  } catch (error) {
    console.error("Error parsing DELETE request body:", error);
    return NextResponse.json(
      { error: "Invalid JSON in request body" },
      { status: 400 }
    );
  }

  const { userId } = body;

  // Validate input
  if (!userId || !id) {
    return NextResponse.json(
      { error: "Missing userId or recommendationId" },
      { status: 400 }
    );
  }

  // Optional: Validate userId format
  // If userId is stored as ObjectId in DB
  // if (!ObjectId.isValid(userId)) {
  //   return NextResponse.json(
  //     { error: "Invalid userId format" },
  //     { status: 400 }
  //   );
  // }

  try {
    const db = await connectToDatabase.connectToDatabase();
    const recommendationsCollection = db.collection("recommendations");

    // Perform the deletion using $pull
    const deleteResult = await recommendationsCollection.updateOne(
      { userId: userId }, // Use ObjectId(userId) if stored as ObjectId
      { $pull: { recommendations: { id } } }
    );

    if (deleteResult.modifiedCount === 0) {
      return NextResponse.json(
        { error: "Recommendation not found or already deleted" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Recommendation deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in DELETE request:", error);
    return NextResponse.json(
      { error: "Failed to delete recommendation" },
      { status: 500 }
    );
  }
}



export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const recommendationId = params.id;
    const body = await req.json();
    const { userId, newStep, addToBothArrays, note, ...updates } = body;

    if (!userId || !recommendationId) {
      return NextResponse.json(
        { error: "Missing userId or recommendationId" },
        { status: 400 }
      );
    }

    const db = await connectToDatabase.connectToDatabase();
    const recommendationsCollection = db.collection("recommendations");
    const campaignsCollection = db.collection("campaigns");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateOperations: Record<string, any> = {};

    // Handle updates
    Object.keys(updates).forEach((key) => {
      if (!updateOperations.$set) updateOperations.$set = {};
      updateOperations.$set[`recommendations.$[elem].${key}`] = updates[key];
    });

    // Handle notes and steps
    if (note) {
      if (!updateOperations.$push) updateOperations.$push = {};
      updateOperations.$push["recommendations.$[elem].notes"] = note;
    }

    if (newStep) {
      if (!updateOperations.$push) updateOperations.$push = {};
      updateOperations.$push["recommendations.$[elem].trackingImplementationSteps"] = newStep;
      if (addToBothArrays) {
        updateOperations.$push["recommendations.$[elem].implementationSteps"] = newStep.step;
      }
    }

    // Validate operations
    if (Object.keys(updateOperations).length === 0) {
      return NextResponse.json(
        { error: "No valid update operations provided" },
        { status: 400 }
      );
    }

    // Fetch the current recommendation to check for status changes
    const existingDoc = await recommendationsCollection.findOne({ userId });
    const existingRecommendation = existingDoc?.recommendations.find(
      (rec: { id: string }) => rec.id === recommendationId
    );

    if (!existingRecommendation) {
      return NextResponse.json(
        { error: "Recommendation not found" },
        { status: 404 }
      );
    }

    const previousStatus = existingRecommendation.status;
    const estimatedReduction = existingRecommendation.estimatedEmissionReduction || 0;
    const alreadyCounted = existingRecommendation.countedInCampaign || false;

    // Perform the update
    const updateResult = await recommendationsCollection.updateOne(
      { userId },
      updateOperations,
      { arrayFilters: [{ "elem.id": recommendationId }] }
    );

    if (!updateResult.matchedCount) {
      return NextResponse.json(
        { error: "No matching recommendation found" },
        { status: 404 }
      );
    }

    // Check if the status changed to "Completed" and hasn't been counted yet
    if (previousStatus !== "Completed" && updates.status === "Completed" && !alreadyCounted) {
      const contributionAmount = estimatedReduction;

      await db.collection('User').updateOne(
        { _id: new ObjectId(userId) },
        { 
          $inc: { 
            totalContributions: contributionAmount 
          }
        }
      );
      
      // Find the active campaign
      const activeCampaign = await campaignsCollection.findOne({ status: "Active" });

      if (activeCampaign) {
        const campaignId = activeCampaign._id;

        // Update the campaign's progress
        await campaignsCollection.updateOne(
          { _id: campaignId },
          {
            $inc: { currentProgress: estimatedReduction },
            $set: {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              milestones: activeCampaign.milestones.map((milestone: any) => {
                if (
                  !milestone.reached &&
                  activeCampaign.currentProgress + estimatedReduction >=
                    activeCampaign.targetReduction * (milestone.percentage / 100)
                ) {
                  return { ...milestone, reached: true, reachedAt: new Date() };
                }
                return milestone;
              }),
            },
          }
        );

        // Mark the recommendation as counted
        await recommendationsCollection.updateOne(
          { userId, "recommendations.id": recommendationId },
          { $set: { "recommendations.$.countedInCampaign": true } }
        );
      }
    }

    // Fetch and return the updated recommendation
    const updatedRecommendation = await recommendationsCollection.findOne(
      { userId },
      { projection: { recommendations: { $elemMatch: { id: recommendationId } } } }
    );

    return NextResponse.json(
      { message: "Recommendation updated successfully", recommendation: updatedRecommendation?.recommendations?.[0] },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating recommendation:", error);
    return NextResponse.json(
      { error: "Failed to update recommendation" },
      { status: 500 }
    );
  }
}



async function fetchWeatherData() {
  try {
    const db = await connectToDatabase.connectToDatabase();
    const collection = db.collection("IndonesiaWeather");
    return await collection.find({}).toArray();
  } catch (error) {
    console.error("Error fetching weather data:", error);
    return [];
  }
}

// Helper function to fetch and calculate metrics based on userId
async function getMetrics(userId: string): Promise<MetricData> {
  try {
    const db = await connectToDatabase.connectToDatabase();

    const currentDate = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(currentDate.getFullYear() - 1);

    // Fetch all relevant collections using the dynamic userId
    const [equipmentData, emissionRates, livestockData, cropData, wasteData] = await Promise.all([
      db.collection('Equipment').findOne({ 
        company_id: new ObjectId(userId),
        date: { $lte: currentDate }
      }, { sort: { date: -1 } }),
      db.collection('EmissionRates').findOne({}),
      db.collection('Livestock').findOne({ 
        company_id: new ObjectId(userId),
        date: { $lte: currentDate }
      }, { sort: { date: -1 } }),
      db.collection('Crops').findOne({ 
        company_id: new ObjectId(userId),
        date: { $lte: currentDate }
      }, { sort: { date: -1 } }),
      db.collection('Waste').findOne({ 
        company_id: new ObjectId(userId),
        date: { $lte: currentDate }
      }, { sort: { date: -1 } })
    ]);

    // Get last year's equipment data for comparison
    const lastYearEquipment = await db.collection('Equipment').findOne({
      company_id: new ObjectId(userId),
      date: {
        $gte: oneYearAgo,
        $lt: currentDate
      }
    }, { sort: { date: -1 } });

    // Perform calculations
    const currentEnergyConsumption = equipmentData?.total_electricity_used_kWh || 0;
    const lastYearEnergyConsumption = lastYearEquipment?.total_electricity_used_kWh || 0;
    const energyComparison = lastYearEnergyConsumption ? 
      ((currentEnergyConsumption - lastYearEnergyConsumption) / lastYearEnergyConsumption) * 100 : 
      0;

    const electricityEmissions = (equipmentData?.total_electricity_used_kWh || 0) * 
      (emissionRates?.energy?.electricity_emission || 0);

    const fuelEmissions = (equipmentData?.fuel_consumed_l || 0) * 
      (emissionRates?.fuel_emissions?.[equipmentData?.fuel_type?.toLowerCase()] || 0);

    const livestockEmissions = (livestockData?.number_of_species || 0) * 
      (emissionRates?.animal_emissions?.[livestockData?.species?.toLowerCase()] || 0);

    const cropEmissions = (cropData?.fertilizer_amt_used_kg || 0) * 
      (emissionRates?.crops_emissions?.nitrogen_fertilizer || 0) +
      (cropData?.area_planted_ha || 0) * 
      (emissionRates?.crops_emissions?.soil_emissions || 0);

    const wasteEmissions = (wasteData?.waste_quantity_kg || 0) * 
      (emissionRates?.waste_emissions?.[wasteData?.waste_type?.toLowerCase()] || 0);

    return {
      userId,
      energy: {
        consumption: currentEnergyConsumption,
        previousYearComparison: Number(energyComparison.toFixed(2))
      },
      emissions: {
        total: Number((electricityEmissions + fuelEmissions + livestockEmissions + cropEmissions + wasteEmissions).toFixed(2)),
        byCategory: {
          transportation: Number(fuelEmissions.toFixed(2)),
          agriculture: Number((livestockEmissions + cropEmissions).toFixed(2)),
          industry: Number(electricityEmissions.toFixed(2))
        }
      },
      waste: {
        quantity: wasteData?.waste_quantity_kg || 0,
      },
      crops: {
        fertilizer: cropData?.fertilizer_amt_used_kg || 0,
        area: cropData?.area_planted_ha || 0
      },
      livestock: {
        count: livestockData?.number_of_species || 0,
        emissions: Number(livestockEmissions.toFixed(2))
      }
    };
  } catch (error) {
    console.error("Error fetching metrics:", error);
    throw new Error("Failed to fetch metrics");
  }
}