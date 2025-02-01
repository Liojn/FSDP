import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import connectToDatabase from "@/../dbConfig";

type EmissionsRate = {
    _id: { $oid: string };
    energy: { electricity_emission: number };
    fuel_emissions: {
        diesel: number;
        gasoline: number;
        biodiesel: number;
        naturalgas: number;
        propane: number;
    };
    animal_emissions: {
        chicken: number;
        cattle: number;
        goat: number;
        pig: number;
    };
    crops_emissions: {
        nitrogen_fertilizer: number;
        soil_emissions: number;
    };
    waste_emissions: {
        manure: number;
        yard_waste: number;
    };
    absorption_rate_per_year_kg: number;
};

type Equipment = {
    _id: { $oid: string };
    company_id: { $oid: string };
    fuel_type: string;
    fuel_consumed_l: number;
    total_electricity_used_kWh: number;
    date: { $date: string };
};

type Crop = {
    _id: { $oid: string };
    company_id: { $oid: string };
    crop_type: string;
    area_planted_ha: number;
    fertilizer_amt_used_kg: number,
    date: { $date: string };
    status: string;
};

type Waste = {
    _id: { $oid: string };
    company_id: { $oid: string };
    waste_type: string;
    waste_quantity_kg: number;
    date: { $date: string };
};

interface Badge {
  badge_id: ObjectId;
  progress: number;
  isUnlocked: boolean;
  credits: number;
  status: string;
  creditsAwarded?: boolean;
}

const calculateUniqueCropTypes = (crops: Crop[]) => {
  return new Set(crops.map(crop => crop.crop_type)).size;
};

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

const calculateWasteEmissions = (waste: Waste[], emissionRates: EmissionsRate) => {
  return waste.reduce((total, w) => {
    const rate = w.waste_type === 'manure' 
      ? emissionRates.waste_emissions.manure 
      : emissionRates.waste_emissions.yard_waste;
    return total + (w.waste_quantity_kg * rate);
  }, 0);
};

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

const calculateFertilizerEmissions = (crops: Crop[], emissionRates: EmissionsRate) => {
  const totalArea = crops.reduce((sum, crop) => sum + crop.area_planted_ha, 0) || 1;
  const totalFertilizer = crops.reduce((sum, crop) => sum + crop.fertilizer_amt_used_kg, 0);
  
  return (totalFertilizer * emissionRates.crops_emissions.nitrogen_fertilizer) / totalArea;
};

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
    if (!db) throw new Error("Database connection failed");

    const { userId } = await request.json();
    if (!userId) return NextResponse.json({ error: "Missing user ID" }, { status: 400 });

    const objectId = new ObjectId(userId);

    const [crops, equipment, waste, emissionRates, existingBadges, campaignData] = await Promise.all([
      db.collection("Crops").find({ company_id: objectId }).toArray(),
      db.collection("Equipment").find({ company_id: objectId }).toArray(),
      db.collection("Waste").find({ company_id: objectId }).toArray(),
      db.collection("EmissionRates").findOne({}),
      db.collection("UserBadges").find({ user_id: objectId }).toArray(),
      db.collection("User").findOne({ _id: objectId }),
      db.collection("campaigns").findOne({ status: "Active" })
    ]);

    if (!emissionRates) throw new Error("Emission rates not found");

    const campaignProgress = campaignData ? (campaignData.currentProgress / campaignData.targetReduction) * 100 : 0;

    const campaignBadgeIds: Record<string, ObjectId> = {
      '25': new ObjectId('6730d478aa63b88aefdc9ae3'),
      '50': new ObjectId('6730d478aa63b88aefdc9ae4'),
      '75': new ObjectId('6730d478aa63b88aefdc9ae5'),
      '100': new ObjectId('6730d478aa63b88aefdc9ae6')
    };

    const campaignBadges = [25, 50, 75, 100].map(milestone => ({
      badge_id: campaignBadgeIds[milestone.toString()],
      progress: Math.min((campaignProgress / milestone) * 100, 100),
      isUnlocked: campaignProgress >= milestone,
      credits: milestone === 100 ? 250 : 100,
      status: campaignProgress >= milestone ? "Completed" : "Incomplete",
      creditsAwarded: false
    }));

    const badges: Badge[] = [
      {
        badge_id: new ObjectId("672c51705ad1bf64a1872660"),
        progress: Math.min((calculateUniqueCropTypes(crops) / 3) * 100, 100),
        isUnlocked: calculateUniqueCropTypes(crops) >= 3,
        credits: 100,
        status: calculateUniqueCropTypes(crops) >= 3 ? "Completed" : "Incomplete",
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
        credits: 150, 
        status: (() => {
          const efficiency = calculateEquipmentEfficiency(equipment);
          return efficiency.fuelPerDay < 100 && efficiency.electricityPerDay < 500 ? "Completed" : "Incomplete";
        })(),
      },
      {
        badge_id: new ObjectId("672c51705ad1bf64a1872662"),
        progress: Math.min((500 - calculateWasteEmissions(waste, emissionRates)) / 5, 100),
        isUnlocked: calculateWasteEmissions(waste, emissionRates) < 500,
        credits: 200, 
        status: calculateWasteEmissions(waste, emissionRates) < 500 ? "Completed" : "Incomplete",
      },
      {
        badge_id: new ObjectId("672c51705ad1bf64a1872663"),
        progress: Math.min((1 - calculateWasteReduction(waste)) * 100, 100),
        isUnlocked: calculateWasteReduction(waste) < 0.8,
        credits: 250, 
        status: calculateWasteReduction(waste) < 0.8 ? "Completed" : "Incomplete",
      },
      {
        badge_id: new ObjectId("672c51705ad1bf64a1872664"),
        progress: (() => {
          const emissions = calculateFertilizerEmissions(crops, emissionRates);
          return Math.max(0, Math.min(100, (1 - emissions / 100) * 100));
        })(),
        isUnlocked: calculateFertilizerEmissions(crops, emissionRates) < 100,
        credits: 300, 
        status: calculateFertilizerEmissions(crops, emissionRates) < 100 ? "Completed" : "Incomplete",
      },
      {
        badge_id: new ObjectId("672c51705ad1bf64a1872665"),
        progress: Math.min((500 - calculateElectricityEmissions(equipment, emissionRates)) / 5, 100),
        isUnlocked: calculateElectricityEmissions(equipment, emissionRates) < 500,
        credits: 350, 
        status: calculateElectricityEmissions(equipment, emissionRates) < 500 ? "Completed" : "Incomplete",
      },
      ...campaignBadges
    ];

    const badgesToUpsert = badges.map(badge => {
      const existingBadge = existingBadges.find(
        (eb: { badge_id: { toString: () => string } }) => 
          eb.badge_id.toString() === badge.badge_id.toString()
      );

      const shouldAwardCredits = 
        badge.isUnlocked && 
        badge.status === "Completed" && 
        (!existingBadge || (existingBadge.status !== "Completed" && !existingBadge.creditsAwarded));

      return {
        updateOne: {
          filter: { 
            user_id: objectId,
            badge_id: badge.badge_id 
          },
          update: { 
            $set: {
              user_id: objectId,
              ...badge,
              dateUnlocked: badge.isUnlocked ? new Date() : null,
              creditsAwarded: shouldAwardCredits || existingBadge?.creditsAwarded || false
            }
          },
          upsert: true
        }
      };
    });

    const session = db.client.startSession();
    
    try {
      await session.withTransaction(async () => {
        await db.collection("UserBadges").bulkWrite(badgesToUpsert, { session });

        const creditsToAward = badges
          .filter(badge => badge.isUnlocked && !badge.creditsAwarded)
          .reduce((sum, badge) => sum + badge.credits, 0);

        if (creditsToAward > 0) {
          await db.collection("Companies").updateOne(
            { _id: objectId },
            { $inc: { carbonCredits: creditsToAward } },
            { session }
          );
        }
      });

      await session.endSession();
    } catch (error) {
      await session.endSession();
      throw error;
    }

    return NextResponse.json({ 
      message: "Badges updated successfully",
      badges: badges 
    }, { status: 200 });

  } catch (error) {
    console.error("Error updating badges:", error);
    return NextResponse.json({ error: "Failed to update badges" }, { status: 500 });
  }
}