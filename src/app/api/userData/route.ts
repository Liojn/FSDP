import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import connectToDatabase from "dbConfig";
import { MetricData } from "@/types";



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

// GET /api/userData?userId=...&scopes=Scope1,Scope2,etc
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const scopesParam = searchParams.get("scopes") || "";
    const scopes = scopesParam.split(",").filter(Boolean);

    if (!userId) {
      return NextResponse.json(
        { error: "Missing userId" },
        { status: 400 }
      );
    }

    // Connect to DB
    const db = await connectToDatabase.connectToDatabase();
    const recommendationsCol = db.collection("recommendations");

    // 1. Fetch metrics
    const metrics = await getMetrics(userId);

    // 2. Fetch weather data
    const weatherData = await fetchWeatherData();

    // 3. Fetch recommendations from "recommendations" collection
    //    Filter by userId and (optionally) the scopes.
    const doc = await recommendationsCol.findOne({
      userId,
      ...(scopes.length > 0 && { scopes: { $all: scopes } }),
    });

    // If no doc, default to empty array
    const recommendations = doc?.recommendations || [];

    return NextResponse.json(
      { metrics, weatherData, recommendations },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in /api/userData route:", error);
    return NextResponse.json(
      { error: "Failed to fetch user data" },
      { status: 500 }
    );
  }
}
