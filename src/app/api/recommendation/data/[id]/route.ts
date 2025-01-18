// recommendation/data/[id]/route.ts
/* eslint-disable @typescript-eslint/no-unused-vars */
import { ObjectId } from 'mongodb';
import { MetricData, ResponseData} from "@/types";
import connectToDatabase from "dbConfig";
import { NextRequest, NextResponse } from 'next/server';



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
// recommendation/data/[id]/route.ts
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateOperations: Record<string, any> = {};

    // Handle general updates via $set
    Object.keys(updates).forEach((key) => {
      if (key !== "implementationSteps" && key !== "notes") {
        if (!updateOperations.$set) {
          updateOperations.$set = {};
        }
        updateOperations.$set[`recommendations.$[elem].${key}`] = updates[key];
      }

      // Handle setting the entire 'notes' array if provided
      if (key === "notes") {
        if (!updateOperations.$set) {
          updateOperations.$set = {};
        }
        updateOperations.$set["recommendations.$[elem].notes"] = updates.notes;
      }
    });

    // Handle adding a single note
    if (note) {
      if (!updateOperations.$push) {
        updateOperations.$push = {};
      }
      updateOperations.$push["recommendations.$[elem].notes"] = note;
    }

    // Handle adding a new step
    if (newStep) {
      if (!updateOperations.$push) {
        updateOperations.$push = {};
      }
      updateOperations.$push["recommendations.$[elem].trackingImplementationSteps"] = newStep;

      if (addToBothArrays) {
        updateOperations.$push["recommendations.$[elem].implementationSteps"] = newStep.step;
      }
    }

    // Clean up empty operations
    if (updateOperations.$set && Object.keys(updateOperations.$set).length === 0) {
      delete updateOperations.$set;
    }
    if (updateOperations.$push && Object.keys(updateOperations.$push).length === 0) {
      delete updateOperations.$push;
    }

    // Debug logging
    console.log("Update Operations:", JSON.stringify(updateOperations, null, 2));

    // Perform the update
    const updateResult = await recommendationsCollection.updateOne(
      { userId },
      updateOperations,
      { arrayFilters: [{ "elem.id": recommendationId }] }
    );

    if (!updateResult.matchedCount) {
      return NextResponse.json(
        { error: "No matching recommendation found for this user" },
        { status: 404 }
      );
    }

    // Fetch and return the updated recommendation for verification
    const updatedRecommendation = await recommendationsCollection.findOne(
      { userId },
      { projection: { recommendations: { $elemMatch: { id: recommendationId } } } }
    );

    // Additional Logging
    console.log("Updated Recommendation:", updatedRecommendation);

    return NextResponse.json(
      {
        message: "Recommendation updated successfully",
        recommendation: updatedRecommendation?.recommendations?.[0],
      },
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