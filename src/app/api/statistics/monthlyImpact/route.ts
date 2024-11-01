import { NextResponse } from 'next/server';
const { connectToDatabase } = require("../../../../../dbConfig");

interface EquipmentItem {
    total_electricity_used_kWh?: number;
    fuel_consumed_l?: number;
    fuel_type?: string;
}

interface LivestockItem {
    number_of_species?: number;
    species?: string;
}

interface CropsItem {
    fertilizer_amt_used_kg?: number;
    area_planted_ha?: number;
}

interface WasteItem {
    waste_quantity_kg?: number;
    waste_type?: string;
}

export async function POST(req: Request) {
  try {
    const db = await connectToDatabase();
    const userName = req.headers.get('userName');
    const { endYear, dataType } = await req.json();
    let companyId;

    if (userName) {
      const user = await db.collection('User').findOne({ name: userName });
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      companyId = user._id;
    }

    if (!endYear || !dataType || !companyId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const emissionRates = await db.collection('EmissionRates').findOne({});
    if (!emissionRates) {
      return NextResponse.json({ error: 'Emission rates not found' }, { status: 404 });
    }

    // Initialize an object to store data as arrays for each category
    const monthlyData = {
      equipment: Array(12).fill(0),
      livestock: Array(12).fill(0),
      crops: Array(12).fill(0),
      waste: Array(12).fill(0)
    };

    for (let month = 0; month < 12; month++) {
      const startDate = new Date(endYear, month, 1);
      const endDate = new Date(endYear, month + 1, 0);

      if (dataType === 'carbon-emissions') {
        const equipmentData: EquipmentItem[] = await db.collection('Equipment').find({
          company_id: companyId,
          date: { $gte: startDate, $lte: endDate },
        }).toArray();

        const livestockData: LivestockItem[] = await db.collection('Livestock').find({
          company_id: companyId,
          date: { $gte: startDate, $lte: endDate },
        }).toArray();

        const cropsData: CropsItem[] = await db.collection('Crops').find({
          company_id: companyId,
          date: { $gte: startDate, $lte: endDate },
        }).toArray();

        const wasteData: WasteItem[] = await db.collection('Waste').find({
          company_id: companyId,
          date: { $gte: startDate, $lte: endDate },
        }).toArray();

        // Calculate equipment emissions for the month
        monthlyData.equipment[month] = equipmentData.reduce((sum: number, item: EquipmentItem) => {
          const electricityEmissions = (item.total_electricity_used_kWh || 0) * (emissionRates.energy.electricity_emission || 0);
          const fuelEmissions = (item.fuel_consumed_l || 0) * (emissionRates.fuel_emissions[item.fuel_type?.toLowerCase() || ''] || 0);
          return sum + electricityEmissions + fuelEmissions;
        }, 0);

        // Calculate livestock emissions for the month
        monthlyData.livestock[month] = livestockData.reduce((sum: number, item: LivestockItem) => {
          return sum + (item.number_of_species || 0) * (emissionRates.animal_emissions[item.species?.toLowerCase() || ''] || 0);
        }, 0);

        // Calculate crops emissions for the month
        monthlyData.crops[month] = cropsData.reduce((sum: number, item: CropsItem) => {
          const fertilizerEmissions = (item.fertilizer_amt_used_kg || 0) * (emissionRates.crops_emissions.nitrogen_fertilizer || 0);
          const soilEmissions = (item.area_planted_ha || 0) * (emissionRates.soil_emissions || 0);
          return sum + fertilizerEmissions + soilEmissions;
        }, 0);

        // Calculate waste emissions for the month
        monthlyData.waste[month] = wasteData.reduce((sum: number, item: WasteItem) => {
          return sum + (item.waste_quantity_kg || 0) * (emissionRates.waste_emissions[item.waste_type?.toLowerCase().replace(/_/g, '') || ''] || 0);
        }, 0);

      } else if (dataType === 'energy-consumption') {
        // Calculate energy consumption for equipment only if dataType is energy-consumption
        const equipmentData: EquipmentItem[] = await db.collection('Equipment').find({
          company_id: companyId,
          date: { $gte: startDate, $lte: endDate },
        }).toArray();

        monthlyData.equipment[month] = equipmentData.reduce(
          (sum: number, item: EquipmentItem) => sum + (item.total_electricity_used_kWh || 0),
          0
        );
      }
    }

    return NextResponse.json({ monthlyData });
  } catch (error) {
    console.error("Error fetching data:", error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
