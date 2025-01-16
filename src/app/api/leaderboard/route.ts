/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import  connectToDatabase  from 'dbConfig';
import { ObjectId } from 'mongodb';

// Define types for our data structures
type EmissionRates = {
  energy: {
    electricity_emission: number;
  };
  fuel_emissions: {
    [key: string]: number;
  };
  animal_emissions: {
    [key: string]: number;
  };
  crops_emissions: {
    nitrogen_fertilizer: number;
    soil_emissions: number;
  };
  waste_emissions: {
    [key: string]: number;
  };
  absorption_rate_per_month_kg: number;
};

type CollectionData = {
  [key: string]: any[];
};

const collections = [
  'Crops',
  'Livestock',
  'Equipment',
  'Waste',
  'EmissionRates',
  'Forest'
];

export async function GET() {
  try {
    // Connect to database
    const db = await connectToDatabase.connectToDatabase();
    if (!db) {
      throw new Error("Database connection failed.");
    }

    // Get emission rates
    const emissionRates = await db.collection('EmissionRates').findOne({}) as EmissionRates;
    if (!emissionRates) {
      throw new Error("Emission rates not found");
    }

    // Get all companies
    const companies = await db.collection('users').find({}).toArray();

    const companyDataPromises = companies.map(async (company: { _id: number; name: any; }) => {
      const companyId = new ObjectId(company._id);
      const results: CollectionData = {};

      // Fetch all data for each collection without date filtering
      for (const collectionName of collections) {
        if (collectionName !== 'EmissionRates') {
          const collection = db.collection(collectionName);
          results[collectionName] = await collection.find({ 
            company_id: companyId 
          }).toArray();
        }
      }

      // Calculate equipment emissions and energy consumption
      const equipmentMetrics = results.Equipment.reduce((acc, eq) => {
        const fuelEmission = emissionRates.fuel_emissions[eq.fuel_type.toLowerCase()] * eq.fuel_consumed_l;
        const electricityEmission = emissionRates.energy.electricity_emission * eq.total_electricity_used_kWh;
        const fuelKwh = eq.fuel_consumed_l * 10; // Approximate conversion

        return {
          emissions: acc.emissions + fuelEmission + electricityEmission,
          energy: acc.energy + eq.total_electricity_used_kWh + fuelKwh
        };
      }, { emissions: 0, energy: 0 });

      // Calculate livestock emissions
      const livestockEmissions = results.Livestock.reduce((total, animal) => {
        return total + (
          emissionRates.animal_emissions[animal.species.toLowerCase()] * 
          animal.number_of_species
        );
      }, 0);

      // Calculate crop emissions
      const cropEmissions = results.Crops.reduce((total, crop) => {
        const fertilizerEmission = 
          emissionRates.crops_emissions.nitrogen_fertilizer * 
          crop.fertilizer_amt_used_kg;
        const soilEmission = 
          emissionRates.crops_emissions.soil_emissions * 
          crop.area_planted_ha;
        return total + fertilizerEmission + soilEmission;
      }, 0);

      // Calculate waste emissions
      const wasteEmissions = results.Waste.reduce((total, w) => {
        return total + (
          emissionRates.waste_emissions[w.waste_type.toLowerCase()] * 
          w.waste_quantity_kg
        );
      }, 0);

      // Calculate forest absorption
      const forestAbsorption = results.Forest.reduce((total, forest) => {
        return total + (
          emissionRates.absorption_rate_per_month_kg * 
          forest.area_ha
        );
      }, 0);

      // Calculate total emissions and subtract absorption
      const totalEmissions = 
        equipmentMetrics.emissions + 
        livestockEmissions + 
        cropEmissions + 
        wasteEmissions - 
        forestAbsorption;

      // Calculate scores (0-100 scale)
      const maxEmissions = 10000; // Adjust baseline as needed
      const maxEnergy = 5000; // Adjust baseline as needed
      
      const emissionScore = Math.max(0, Math.min(100, 100 - (totalEmissions / maxEmissions * 100)));
      const energyScore = Math.max(0, Math.min(100, 100 - (equipmentMetrics.energy / maxEnergy * 100)));

      return {
        name: company.name,
        carbonScore: Math.round(emissionScore),
        energyScore: Math.round(energyScore),
        totalEmissions: Math.round(totalEmissions),
        totalEnergy: Math.round(equipmentMetrics.energy)
      };
    });

    const companyData = await Promise.all(companyDataPromises);
    
    // Sort by carbon score
    companyData.sort((a, b) => b.carbonScore - a.carbonScore);

    return NextResponse.json({ 
      status: "success",
      data: companyData 
    });

  } catch (error) {
    console.error("Error in leaderboard API:", error);
    return NextResponse.json({ 
      status: "error",
      message: error instanceof Error ? error.message : "An unknown error occurred",
    }, { status: 500 });
  }
}