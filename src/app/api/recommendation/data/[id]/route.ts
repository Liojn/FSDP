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

  const { id } = params;
  const scopesParam = request.nextUrl.searchParams.get("scopes");
  const scopes = scopesParam ? scopesParam.split(",").filter(Boolean) : [];


if (!ObjectId.isValid(id)) {
  console.warn(`Invalid User ID format: ${id}`);
  return NextResponse.json(
    { error: `Invalid User ID format: ${id}` },
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
      getMetrics(id),
      fetchWeatherData(),
    ]);
    console.log('Metrics and weather data fetched:', { 
      metricsReceived: !!metrics,
      weatherDataReceived: !!weatherData 
    });

    console.log('Querying recommendations with scopes:', scopes);
    // Fetch recommendations from the database based on userId and scopes
    const recommendationsCollection = db.collection("recommendations");
    const recommendations = await recommendationsCollection.findOne({
      userId: id,
      ...(scopes.length > 0 && { scopes: { $all: scopes } }),
    });
    console.log('Recommendations found:', !!recommendations);

    const responseData: ResponseData = { metrics, weatherData };
    if (recommendations) {
      responseData.recommendations = recommendations.recommendations;
    }
    console.log('Sending response with data:', {
      hasMetrics: !!responseData.metrics,
      hasWeather: !!responseData.weatherData,
      hasRecommendations: !!responseData.recommendations
    });

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Error in GET request:", error);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
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
