import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import connectToDatabase from "@/../dbConfig";

// Helper function to calculate unique crop types
const calculateUniqueCropTypes = (crops: Crop[]) => {
  return new Set(crops.map(crop => crop.crop_type)).size;
};

// Helper function to calculate equipment efficiency
const calculateEquipmentEfficiency = (equipment: Equipment[]) => {
  if (equipment.length === 0) return { fuelPerDay: 0, electricityPerDay: 0 };
  
  const totalDays = Math.ceil(
    (new Date(equipment[equipment.length - 1].date.$date).getTime() - 
     new Date(equipment[0].date.$date).getTime()) / (1000 * 60 * 60 * 24)
  ) || 1;

  const totalFuel = equipment.reduce((sum, eq) => sum + eq.fuel_consumed_l, 0);
  const totalElectricity = equipment.reduce((sum, eq) => sum + eq.total_electricity_used_kWh, 0);

  return {
    fuelPerDay: totalFuel / totalDays,
    electricityPerDay: totalElectricity / totalDays
  };
};

// Helper function to calculate waste emissions
const calculateWasteEmissions = (waste: Waste[], emissionRates: EmissionsRate) => {
  return waste.reduce((total, w) => {
    const rate = w.waste_type === 'manure' 
      ? emissionRates.waste_emissions.manure 
      : emissionRates.waste_emissions.yard_waste;
    return total + (w.waste_quantity_kg * rate);
  }, 0);
};

// Helper function to compare waste year over year
const calculateWasteReduction = (waste: Waste[]) => {
  const currentYear = new Date().getFullYear();
  const previousYear = currentYear - 1;
  
  const currentYearWaste = waste
    .filter(w => new Date(w.date.$date).getFullYear() === currentYear)
    .reduce((sum, w) => sum + w.waste_quantity_kg, 0);
    
  const previousYearWaste = waste
    .filter(w => new Date(w.date.$date).getFullYear() === previousYear)
    .reduce((sum, w) => sum + w.waste_quantity_kg, 0);
    
  return previousYearWaste > 0 
    ? currentYearWaste / previousYearWaste 
    : 1;
};

// Helper function to calculate fertilizer emissions per hectare
const calculateFertilizerEmissions = (crops: Crop[], emissionRates: EmissionsRate) => {
  const totalArea = crops.reduce((sum, crop) => sum + crop.area_planted_ha, 0) || 1;
  const totalFertilizer = crops.reduce((sum, crop) => sum + crop.fertilizer_amt_used_kg, 0);
  
  return (totalFertilizer * emissionRates.crops_emissions.nitrogen_fertilizer) / totalArea;
};

// Helper function to calculate electricity emissions
const calculateElectricityEmissions = (equipment: Equipment[], emissionRates: EmissionsRate) => {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  
  return equipment
    .filter(eq => new Date(eq.date.$date) >= sixMonthsAgo)
    .reduce((total, eq) => total + (eq.total_electricity_used_kWh * emissionRates.energy.electricity_emission), 0);
};

export async function POST(request: NextRequest) {
  try {
    const db = await connectToDatabase.connectToDatabase();
    if (!db) {
      throw new Error("Database connection failed");
    }

    // Get the user ID from the request body
    const { userId } = await request.json();
    if (!userId) {
      return NextResponse.json({ error: "Missing user ID" }, { status: 400 });
    }

    const objectId = new ObjectId(userId);

    // Fetch all necessary data
    const [
      crops,
      equipment,
      waste,
      emissionRates,
    ] = await Promise.all([
      db.collection("Crops").find({ company_id: objectId }).toArray(),
      db.collection("Equipment").find({ company_id: objectId }).toArray(),
      db.collection("Waste").find({ company_id: objectId }).toArray(),
      db.collection("EmissionRates").findOne({}),
    ]);

    if (!emissionRates) {
      throw new Error("Emission rates not found");
    }

    // Delete existing user badges
    await db.collection("UserBadges").deleteMany({ user_id: objectId });

    // Calculate new badges
    const badges = [
      {
        badge_id: new ObjectId("672c51705ad1bf64a1872660"),
        progress: Math.min((calculateUniqueCropTypes(crops) / 4) * 100, 100),
        isUnlocked: calculateUniqueCropTypes(crops) >= 4,
      },
      {
        badge_id: new ObjectId("672c51705ad1bf64a1872661"),
        progress: (() => {
          const efficiency = calculateEquipmentEfficiency(equipment);
          const fuelProgress = Math.max(0, 100 - (efficiency.fuelPerDay / 100 * 100));
          const electricityProgress = Math.max(0, 100 - (efficiency.electricityPerDay / 500 * 100));
          return Math.min((fuelProgress + electricityProgress) / 2, 100);
        })(),
        isUnlocked: (() => {
          const efficiency = calculateEquipmentEfficiency(equipment);
          return efficiency.fuelPerDay < 100 && efficiency.electricityPerDay < 500;
        })(),
      },
      {
        badge_id: new ObjectId("672c51705ad1bf64a1872662"),
        progress: Math.min((500 - calculateWasteEmissions(waste, emissionRates)) / 5, 100),
        isUnlocked: calculateWasteEmissions(waste, emissionRates) < 500,
      },
      {
        badge_id: new ObjectId("672c51705ad1bf64a1872663"),
        progress: Math.min((1 - calculateWasteReduction(waste)) * 100, 100),
        isUnlocked: calculateWasteReduction(waste) < 0.8,
      },
      {
        badge_id: new ObjectId("672c51705ad1bf64a1872664"),
        progress: (() => {
        const emissions = calculateFertilizerEmissions(crops, emissionRates);
        // Ensure progress is between 0 and 100
        return Math.max(0, Math.min(100, (1 - emissions / 100) * 100));
        })(),
        isUnlocked: calculateFertilizerEmissions(crops, emissionRates) < 100,
    },
      {
        badge_id: new ObjectId("672c51705ad1bf64a1872665"),
        progress: Math.min((500 - calculateElectricityEmissions(equipment, emissionRates)) / 5, 100),
        isUnlocked: calculateElectricityEmissions(equipment, emissionRates) < 500,
      },
    ];

    // Insert new badges with current date for unlocked ones
    const badgesToInsert = badges.map(badge => ({
      user_id: objectId,
      ...badge,
      dateUnlocked: badge.isUnlocked ? new Date() : null,
    }));

    await db.collection("UserBadges").insertMany(badgesToInsert);

    return NextResponse.json({ 
      message: "Badges updated successfully",
      badges: badgesToInsert 
    }, { status: 200 });

  } catch (error) {
    console.error("Error updating badges:", error);
    return NextResponse.json({ error: "Failed to update badges" }, { status: 500 });
  }
}