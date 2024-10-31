import { NextResponse } from 'next/server';
const { connectToDatabase } = require("../../../../../dbConfig");

export async function POST(req: Request) {
  
  interface CropEntry {
    crop_type: "Vegetable" | "Rice" | "Tomato" | "Corn"; // Expected crop types
    date: string;
    fertilizer_amt_used_kg: number;
    area_planted_ha: number;
  }

  try {
    const db = await connectToDatabase();
    const { endYear, dataType } = await req.json();
    const userName = req.headers.get('userName');
    let companyId;

    // Fetch companyId based on userName
    if (userName) {
      const user = await db.collection('User').findOne({ name: userName });
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      companyId = user._id;
    }

    // Initialize an object to store monthly emissions data per crop type
    const cropsMonthlyData = {
      Vegetable: Array(12).fill(0),
      Rice: Array(12).fill(0),
      Tomato: Array(12).fill(0),
      Corn: Array(12).fill(0),
    };
    // Fetch emission rates for calculation
    const emissionRates = await db.collection('EmissionRates').findOne({});
    if (!emissionRates) {
      return NextResponse.json({ error: 'Emission rates not found' }, { status: 404 });
    }

    // Fetch all crop data for the specified year and company
    const cropsData = await db.collection('Crops').find({
      company_id: companyId,
      date: {
        $gte: new Date(`${endYear}-01-01`),
        $lt: new Date(`${endYear}-12-31`)
      }
    }).toArray();

    if (dataType === 'carbon-emissions') {

      // Process each crop entry to calculate emissions
      cropsData.forEach((entry: CropEntry) => {
        const month = new Date(entry.date).getMonth(); // Get the month (0 = January, 11 = December)
        const cropType = entry.crop_type as keyof typeof cropsMonthlyData;

        // Calculate emissions based on fertilizer and soil usage
        const fertilizerEmissions = (entry.fertilizer_amt_used_kg || 0) * (emissionRates.crops_emissions.nitrogen_fertilizer || 0);
        const soilEmissions = (entry.area_planted_ha || 0) * (emissionRates.soil_emissions || 0);
        const totalEmissions = fertilizerEmissions + soilEmissions;

        // Log the emissions calculation for debugging
        console.log(`Crop Type: ${cropType}, Month: ${month}, Fertilizer Emissions: ${fertilizerEmissions}, Soil Emissions: ${soilEmissions}, Total Emissions: ${totalEmissions}`);
        console.log("Emission Rates:", emissionRates);
        console.log("Crops Data:", cropsData);

        // Update the emissions data for the current crop type and month
        if (cropsMonthlyData[cropType]) {
          cropsMonthlyData[cropType][month] += totalEmissions;
        }
      });
    } else if (dataType === 'energy-consumption') {
      cropsData.forEach((entry: CropEntry) => {
        const month = new Date(entry.date).getMonth(); 
        const cropType = entry.crop_type as keyof typeof cropsMonthlyData;
        cropsMonthlyData[cropType][month] += 0;
      });
    }
    return NextResponse.json({ monthlyEmissions: cropsMonthlyData });
  } catch (error) {
      console.error("Error fetching crop data:", error);
      return NextResponse.json({ error: 'Failed to fetch crop data' }, { status: 500 });
  }
}
