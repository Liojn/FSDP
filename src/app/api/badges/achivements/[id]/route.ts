import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/../dbConfig";
import { ObjectId } from "mongodb";

// List of Collections to retrieve
const collections = ["Crops", "Livestock", "Equipment", "Waste", "EmissionRates", "Forest"];

// Define the CollectionData type to encapsulate all collections
type CollectionData = {
  EmissionRates: EmissionsRate[];
  Equipment: Equipment[];
  Crops: Crop[];
  Livestock: Livestock[];
  Waste: Waste[];
  Forest: Forest[];
};

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

// Type for Equipment
type Equipment = {
    _id: { $oid: string };
    company_id: { $oid: string };
    fuel_type: string;
    fuel_consumed_l: number;
    total_electricity_used_kWh: number;
    date: { $date: string };
};

// Type for Crops
type Crop = {
    _id: { $oid: string };
    company_id: { $oid: string };
    crop_type: string;
    area_planted_ha: number;
    fertilizer_amt_used_kg: number,
    date: { $date: string };
    yield_tons: number;
};

// Type for Livestock
type Livestock = {
    _id: { $oid: string };
    company_id: { $oid: string };
    species: string;
    number_of_species: number;
    date: { $date: string };
};

// Type for Equipment
type Waste = {
    _id: { $oid: string };
    company_id: { $oid: string };
    waste_type: string;
    waste_quantity_kg: number;
    date: { $date: string };
};

// Type for Forest
type Forest = {
    _id: { $oid: string };
    company_id: { $oid: string };
    totalAreaInHectares: number;
    date: { $date: string };
};


export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = params?.id;
    if (!userId || userId.length !== 24) {
      return NextResponse.json({ error: "Invalid or missing user ID" }, { status: 400 });
    }

    const objectId = new ObjectId(userId);
    const db = await connectToDatabase.connectToDatabase();
    if (!db) {
      throw new Error("Database connection failed.");
    }

    // Query UserBadges collection to retrieve user's badge data
    const userBadgesCollection = db.collection("UserBadges");
    const userBadges = await userBadgesCollection
      .find({ user_id: objectId })
      .project({
        _id: 1,
        user_id: 1,
        badge_id: 1,
        progress: 1,
        isUnlocked: 1,
        dateUnlocked: 1,
      })
      .toArray();

    // Initialize an object to hold data for each collection
    const results: CollectionData = {
      EmissionRates: [],
      Equipment: [],
      Crops: [],
      Livestock: [],
      Waste: [],
      Forest: [],
    };

    // Loop through each collection to fetch all data based on the specified company_id
    for (const collectionName of collections) {
      const collection = db.collection(collectionName);
      const query = collectionName === "EmissionRates"
        ? {} // Fetch everything for EmissionRates (no company_id filter)
        : { company_id: objectId };
      const documents = await collection.find(query).toArray();
      results[collectionName as keyof CollectionData] = documents;
    }

    // Combine user badges and all collection data in the response
    const achievementsData = {
      userBadges,
      collections: results, // Full data from all collections
    };

    return NextResponse.json(achievementsData, { status: 200 });
  } catch (error) {
    console.error("Error fetching achievements:", error);
    return NextResponse.json({ error: "Failed to fetch achievements" }, { status: 500 });
  }
}
