// src/app/api/metrics/[id]/route.ts

import { ObjectId } from 'mongodb';
import { MetricData } from '@/types';
import connectToDatabase from 'dbConfig';
import { NextRequest, NextResponse } from 'next/server';

// Define the API route handler for GET requests
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;

  // Validate `id` as a valid MongoDB ObjectId
  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ error: 'Invalid User ID format' }, { status: 400 });
  }

  try {
    // Fetch metrics using `getMetrics` function
    const metrics = await getMetrics(id);
    return NextResponse.json(metrics, { status: 200 });
  } catch (error) {
    console.error('Error fetching data:', error); // Log detailed error
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
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
      db.collection('Equipment').findOne(
        {
          company_id: new ObjectId(userId),
          date: { $lte: currentDate },
        },
        { sort: { date: -1 } }
      ),
      db.collection('EmissionRates').findOne({}),
      db.collection('Livestock').findOne(
        {
          company_id: new ObjectId(userId),
          date: { $lte: currentDate },
        },
        { sort: { date: -1 } }
      ),
      db.collection('Crops').findOne(
        {
          company_id: new ObjectId(userId),
          date: { $lte: currentDate },
        },
        { sort: { date: -1 } }
      ),
      db.collection('Waste').findOne(
        {
          company_id: new ObjectId(userId),
          date: { $lte: currentDate },
        },
        { sort: { date: -1 } }
      ),
    ]);

        // Add console logs to inspect the data
    console.log("Equipment Data:", equipmentData);
    console.log("Emission Rates:", emissionRates);
    console.log("Livestock Data:", livestockData);
    console.log("Crop Data:", cropData);
    console.log("Waste Data:", wasteData);

    // Get last year's equipment data for comparison
    const lastYearEquipment = await db.collection('Equipment').findOne(
      {
        company_id: new ObjectId(userId),
        date: {
          $gte: oneYearAgo,
          $lt: currentDate,
        },
      },
      { sort: { date: -1 } }
    );

   // Perform calculations
    const currentEnergyConsumption = equipmentData?.total_electricity_used_kWh || 0;
    const lastYearEnergyConsumption = lastYearEquipment?.total_electricity_used_kWh || 0;
    const energyComparison = lastYearEnergyConsumption
      ? ((currentEnergyConsumption - lastYearEnergyConsumption) / lastYearEnergyConsumption) * 100
      : 0;

    console.log("Current Energy Consumption:", currentEnergyConsumption);
    console.log("Last Year Energy Consumption:", lastYearEnergyConsumption);
    console.log("Energy Comparison (%):", energyComparison);

    const electricityEmissionFactor = emissionRates?.energy?.electricity_emission || 0;
    const electricityEmissions = currentEnergyConsumption * electricityEmissionFactor;

    console.log("Electricity Emission Factor:", electricityEmissionFactor);
    console.log("Electricity Emissions:", electricityEmissions);

    const fuelTypeKey = equipmentData?.fuel_type?.toLowerCase();
    const fuelEmissionFactor = emissionRates?.fuel_emissions?.[fuelTypeKey] || 0;
    const fuelEmissions = (equipmentData?.fuel_consumed_l || 0) * fuelEmissionFactor;

    console.log("Fuel Type Key:", fuelTypeKey);
    console.log("Fuel Emission Factor:", fuelEmissionFactor);
    console.log("Fuel Emissions:", fuelEmissions);

    const livestockSpeciesKey = livestockData?.species?.toLowerCase();
    const animalEmissionFactor = emissionRates?.animal_emissions?.[livestockSpeciesKey] || 0;
    const livestockEmissions = (livestockData?.number_of_species || 0) * animalEmissionFactor;

    console.log("Livestock Species Key:", livestockSpeciesKey);
    console.log("Animal Emission Factor:", animalEmissionFactor);
    console.log("Livestock Emissions:", livestockEmissions);

    const fertilizerEmissionFactor = emissionRates?.crops_emissions?.nitrogen_fertilizer || 0;
    const soilEmissionFactor = emissionRates?.crops_emissions?.soil_emissions || 0;
    const cropEmissions =
      (cropData?.fertilizer_amt_used_kg || 0) * fertilizerEmissionFactor +
      (cropData?.area_planted_ha || 0) * soilEmissionFactor;

    console.log("Fertilizer Emission Factor:", fertilizerEmissionFactor);
    console.log("Soil Emission Factor:", soilEmissionFactor);
    console.log("Crop Emissions:", cropEmissions);

    const wasteTypeKey = wasteData?.waste_type?.toLowerCase();
    const wasteEmissionFactor = emissionRates?.waste_emissions?.[wasteTypeKey] || 0;
    const wasteEmissions = (wasteData?.waste_quantity_kg || 0) * wasteEmissionFactor;

    console.log("Waste Type Key:", wasteTypeKey);
    console.log("Waste Emission Factor:", wasteEmissionFactor);
    console.log("Waste Emissions:", wasteEmissions);

    const totalEmissions = electricityEmissions + fuelEmissions + livestockEmissions + cropEmissions + wasteEmissions;

    console.log("Total Emissions:", totalEmissions);
    console.log("Metrics to be returned:", {
  energy: {
    consumption: currentEnergyConsumption,
    previousYearComparison: Number(energyComparison.toFixed(2)),
  },
  emissions: {
    total: Number(totalEmissions.toFixed(2)),
    byCategory: {
      transportation: Number(fuelEmissions.toFixed(2)),
      agriculture: Number((livestockEmissions + cropEmissions).toFixed(2)),
      industry: Number(electricityEmissions.toFixed(2)),
    },
  },
  waste: {
    quantity: wasteData?.waste_quantity_kg || 0,
  },
  crops: {
    fertilizer: cropData?.fertilizer_amt_used_kg || 0,
    area: cropData?.area_planted_ha || 0,
  },
  livestock: {
    count: livestockData?.number_of_species || 0,
    emissions: Number(livestockEmissions.toFixed(2)),
  },
});

    return {
      userId,
      energy: {
        consumption: currentEnergyConsumption,
        previousYearComparison: Number(energyComparison.toFixed(2)),
      },
      emissions: {
        total: Number(
          (
            electricityEmissions +
            fuelEmissions +
            livestockEmissions +
            cropEmissions +
            wasteEmissions
          ).toFixed(2)
        ),
        byCategory: {
          transportation: Number(fuelEmissions.toFixed(2)),
          agriculture: Number((livestockEmissions + cropEmissions).toFixed(2)),
          industry: Number(electricityEmissions.toFixed(2)),
        },
      },
      waste: {
        quantity: wasteData?.waste_quantity_kg || 0,
      },
      crops: {
        fertilizer: cropData?.fertilizer_amt_used_kg || 0,
        area: cropData?.area_planted_ha || 0,
      },
      livestock: {
        count: livestockData?.number_of_species || 0,
        emissions: Number(livestockEmissions.toFixed(2)),
      },
    };
  } catch (error) {
    console.error('Error fetching metrics:', error);
    throw new Error('Failed to fetch metrics');
  }
}
