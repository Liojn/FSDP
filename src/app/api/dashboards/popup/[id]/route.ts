import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from '@/../dbConfig';
import { ObjectId } from 'mongodb';

// List of Collections that we would be using
const collections = [
    'Crops',
    'Livestock',
    'Equipment',
    'Waste',
    'EmissionRates',
];

// Types remain the same
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
    date: string;
};

type Crop = {
    _id: { $oid: string };
    company_id: { $oid: string };
    crop_type: string;
    status: string;
    area_planted_ha: number;
    fertilizer_amt_used_kg: number;
    date: string;
    yield_tons: number;
};

type Livestock = {
    _id: { $oid: string };
    company_id: { $oid: string };
    species: string;
    number_of_species: number;
    date: string;
};

type Waste = {
    _id: { $oid: string };
    company_id: { $oid: string };
    waste_type: string;
    waste_quantity_kg: number;
    date: string;
};

type CollectionData = {
    EmissionRates: EmissionsRate[];
    Equipment: Equipment[];
    Crops: Crop[];
    Livestock: Livestock[];
    Waste: Waste[];
};


//Type explicit for Calculate DetailedMissions
type Emissions = {
    equipment: Array<{
        date: string;
        fuelType: string;
        fuelConsumed: number;
        electricityUsed: number;
        fuelEmissions: number;
        electricityEmissions: number;
        totalEmissions: number;
    }>;
    livestock: Array<{
        date: string;
        species: string;
        count: number;
        emissions: number;
    }>;
    crops: Array<{
        date: string;
        cropType: string;
        areaPlanted: number;
        fertilizerUsed: number;
        yieldTons: number;
        fertilizerEmissions: number;
        soilEmissions: number;
        totalEmissions: number;
    }>;
    waste: Array<{
        date: string;
        wasteType: string;
        quantity: number;
        emissions: number;
    }>;
    totalEmissions: number;
};

// Modified to calculate emissions for specific year and month
const calculateDetailedEmissions = (
    equipmentData: Equipment[],
    livestockData: Livestock[],
    cropsData: Crop[],
    wasteData: Waste[],
    emissionData: EmissionsRate[],
    month: number | null
): Emissions => {
    const emissions: Emissions = {
        equipment: [],
        livestock: [],
        crops: [],
        waste: [],
        totalEmissions: 0
    };

    // Process equipment data
    equipmentData.forEach(equipment => {
        const equipDate = new Date(equipment.date);
        const matchesMonth = month === null || equipDate.getUTCMonth() === month;

        if (matchesMonth) {
            const fuelType = equipment.fuel_type.toLowerCase() as keyof EmissionsRate["fuel_emissions"];
            const fuelEmission = equipment.fuel_consumed_l * emissionData[0].fuel_emissions[fuelType];
            const electricityEmission = equipment.total_electricity_used_kWh * emissionData[0].energy.electricity_emission;

            emissions.equipment.push({
                date: equipment.date,
                fuelType: equipment.fuel_type,
                fuelConsumed: equipment.fuel_consumed_l,
                electricityUsed: equipment.total_electricity_used_kWh,
                fuelEmissions: fuelEmission,
                electricityEmissions: electricityEmission,
                totalEmissions: fuelEmission + electricityEmission
            });

            emissions.totalEmissions += fuelEmission + electricityEmission;
        }
    });

    // Process livestock data
    livestockData.forEach(livestock => {
        const liveDate = new Date(livestock.date);
        const matchesMonth = month === null || liveDate.getUTCMonth() === month;

        if (matchesMonth) {
            const animalType = livestock.species.toLowerCase() as keyof EmissionsRate["animal_emissions"];
            const animalEmission = livestock.number_of_species * emissionData[0].animal_emissions[animalType];

            emissions.livestock.push({
                date: livestock.date,
                species: livestock.species,
                count: livestock.number_of_species,
                emissions: animalEmission
            });

            emissions.totalEmissions += animalEmission;
        }
    });

    // Process crops data
    cropsData.forEach(crop => {
        const cropDate = new Date(crop.date);
        const matchesMonth = month === null || cropDate.getUTCMonth() === month;

        if (matchesMonth) {
            let slash_emit = 0;
            if (crop.status === "Land Preparation") {
                slash_emit += (19800 * crop.area_planted_ha); // 1.98kg/m² = 19800kg/ha
            }
            const fertEmission = crop.fertilizer_amt_used_kg * emissionData[0].crops_emissions["nitrogen_fertilizer"];
            const soilEmission = crop.area_planted_ha * emissionData[0].crops_emissions["soil_emissions"];
            const totalCropEmission = fertEmission + soilEmission + slash_emit;

            emissions.crops.push({
                date: crop.date,
                cropType: crop.crop_type,
                areaPlanted: crop.area_planted_ha,
                fertilizerUsed: crop.fertilizer_amt_used_kg,
                yieldTons: crop.yield_tons,
                fertilizerEmissions: fertEmission,
                soilEmissions: soilEmission,
                totalEmissions: totalCropEmission
            });

            emissions.totalEmissions += totalCropEmission;
        }
    });

    // Process waste data
    wasteData.forEach(waste => {
        const wasteDate = new Date(waste.date);
        const matchesMonth = month === null || wasteDate.getUTCMonth() === month;

        if (matchesMonth) {
            const wasteType = waste.waste_type.toLowerCase() as keyof EmissionsRate["waste_emissions"];
            const wasteEmission = waste.waste_quantity_kg * emissionData[0].waste_emissions[wasteType];

            emissions.waste.push({
                date: waste.date,
                wasteType: waste.waste_type,
                quantity: waste.waste_quantity_kg,
                emissions: wasteEmission
            });

            emissions.totalEmissions += wasteEmission;
        }
    });

    return emissions;
};


// Adjusted API route handler to use parameters similarly to the first code
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const companyId = params.id;
        const objectId = new ObjectId(companyId);

        const url = new URL(request.url);
        const yearParam = url.searchParams.get('year');
        const monthParam = url.searchParams.get('month');

        if (!yearParam) {
            throw new Error("Year parameter is required.");
        }
        const year = parseInt(yearParam, 10);
        if (isNaN(year)) {
            throw new Error("Invalid year parameter.");
        }

        const month = monthParam ? parseInt(monthParam, 10) : null;
        if (month !== null && (isNaN(month) || month < 0 || month > 11)) {
            throw new Error("Invalid month parameter. Must be between 0 and 11.");
        }

        const db = await connectToDatabase.connectToDatabase();
        if (!db) throw new Error("Database connection failed.");

        const results: CollectionData = {
            EmissionRates: [],
            Equipment: [],
            Crops: [],
            Livestock: [],
            Waste: [],
        };

        for (const collectionName of collections) {
            const collection = db.collection(collectionName);
            const query = collectionName === 'EmissionRates'
                ? {}
                : {
                    company_id: objectId,
                    date: {
                        $gte: new Date(`${year}-01-01T00:00:00.000Z`),
                        $lt: new Date(`${year + 1}-01-01T00:00:00.000Z`)
                    }
                };
            const documents = await collection.find(query).toArray();
            // Type the documents explicitly based on the collection
            switch (collectionName) {
                case 'EmissionRates':
                    results.EmissionRates = documents as EmissionsRate[];
                    break;
                case 'Equipment':
                    results.Equipment = documents as Equipment[];
                    break;
                case 'Crops':
                    results.Crops = documents as Crop[];
                    break;
                case 'Livestock':
                    results.Livestock = documents as Livestock[];
                    break;
                case 'Waste':
                    results.Waste = documents as Waste[];
                    break;
                default:
                    break;
            }
        }

        const detailedEmissions = calculateDetailedEmissions(
            results.Equipment,
            results.Livestock,
            results.Crops,
            results.Waste,
            results.EmissionRates,
            month
        );

        return NextResponse.json({
            success: true,
            data: detailedEmissions
        });

    } catch (error) {
        console.error("Error fetching data:", error);
        return NextResponse.json(
            { error: 'An error occurred while fetching data.' },
            { status: 500 }
        );
    }
}
