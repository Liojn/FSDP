import { NextRequest, NextResponse } from "next/server"
import  connectToDatabase  from '@/../dbConfig'
import { ObjectId } from 'mongodb';

//List of Collections that we would be using
const collections = [
    'Crops',
    'Livestock',
    'Equipment',
    'Waste',
    'EmissionRates',
    'Forest'
]
//Type for EmissionRate
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
    date: string; //string for direct access
};

// Type for Crops
type Crop = {
    _id: { $oid: string };
    company_id: { $oid: string };
    crop_type: string;
    status: string;
    area_planted_ha: number;
    fertilizer_amt_used_kg: number,
    date: string; //string for direct access
    yield_tons: number;
};

// Type for Livestock
type Livestock = {
    _id: { $oid: string };
    company_id: { $oid: string };
    species: string;
    number_of_species: number;
    date: string; //string for direct access
};

// Type for Equipment
type Waste = {
    _id: { $oid: string };
    company_id: { $oid: string };
    waste_type: string;
    waste_quantity_kg: number;
    date: string; //string for direct access
};

// Type for Forest
type Forest = {
    _id: { $oid: string };
    company_id: { $oid: string };
    totalAreaInHectares: number;
    date: string; //string for direct access
};

// Define the CollectionData type to encapsulate all collections
type CollectionData = {
    EmissionRates: EmissionsRate[]; //Array of EmissionRate objects
    Equipment: Equipment[];         //Array of Equipment objects
    Crops: Crop[];                 //Array of Crop objects
    Livestock: Livestock[];        //Array of Livestock objects
    Waste: Waste[];                //Array of Waste objects
    Forest: Forest[];              //Array of Forest objects
};


//Method 2 for carbon emissions
const CalcluteMonthlyCarbonEmission = (equipmentData: Equipment[], livestockData: Livestock[], cropsData: Crop[], wasteData: Waste[], emissionData: EmissionsRate[], forestData: Forest[]) =>{
    const monthlyEmissions: number[] = new Array(12).fill(0); //for bar chart monthly

    //Emission of one category
    for (const equipment of equipmentData) {
        const electricEmit = equipment.total_electricity_used_kWh * emissionData[0].energy.electricity_emission;

        // Get fuel emissions
        //console.log(emissionData[0].fuel_emissions["biodiesel"]);
        const fuelType = equipment.fuel_type.toLowerCase() as keyof EmissionsRate["fuel_emissions"] //ensure is valid key
        const fuel_emit = equipment.fuel_consumed_l * emissionData[0].fuel_emissions[fuelType]; 
        
        // Extract month from the date, insert to respective month
        //console.log(equipment);
        const month = new Date(equipment.date).getUTCMonth(); // Adjusted here
        //console.log(month);
        monthlyEmissions[month] += (fuel_emit + electricEmit);    
    }

    for (const livestock of livestockData) {
        //Get animal emissions
        const animalType = livestock.species.toLowerCase() as keyof EmissionsRate["animal_emissions"];
        const animal_emit = livestock.number_of_species * emissionData[0].animal_emissions[animalType];

        // Extract month from the date, insert to respective month
        const month = new Date(livestock.date).getUTCMonth(); // Adjusted here
        monthlyEmissions[month] += (animal_emit);   
    }

    for (const crop of cropsData) {
        //get crops emission
        const fert_emit = crop.fertilizer_amt_used_kg * emissionData[0].crops_emissions["nitrogen_fertilizer"];
        const soil_emit = crop.area_planted_ha * emissionData[0].crops_emissions["soil_emissions"];
        let slash_emit = 0;
        //Extra, for land prep
        if (crop.status === "Land Preparation"){
            slash_emit += (19800 * crop.area_planted_ha); //1.98kg / m^2 = 19800 kg /ha
        }
        // Extract month from the date, insert to respective month
        const month = new Date(crop.date).getUTCMonth(); // Adjusted here
        monthlyEmissions[month] += (fert_emit + soil_emit + slash_emit);
    }
    
    for (const waste of wasteData) {
        //get waste emission
        const wasteType = waste.waste_type.toLowerCase() as keyof EmissionsRate["waste_emissions"];
        const waste_emit = waste.waste_quantity_kg * emissionData[0].waste_emissions[wasteType];

        // Extract month from the date, insert to respective month
        const month = new Date(waste.date).getUTCMonth(); // Adjusted here
        monthlyEmissions[month] += (waste_emit);
    }

    //The threshold for graph, average absorption rate
    const yearlyAbsorb = forestData[0].totalAreaInHectares * emissionData[0].absorption_rate_per_year_kg;
    const averageAbsorb = (yearlyAbsorb /12);

    return {
        monthlyEmissions,
        averageAbsorb,
    }
}

//API route handler, for calculation of metrics for the 3 Cards
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try{
        const companyId = params.id; //obtain companyId
        console.log(companyId.length); //test wheteher objectId is correct 24 hexa'\
        
        //convert companyId to ObjectId
        const objectId = new ObjectId(companyId);
        //connect to MongoDB
        const db  = await connectToDatabase.connectToDatabase();
        if (!db) {
            throw new Error("Database connection failed."); //If no db instances is defined
        }

        //obtain year from query
        const url = new URL(request.url);
        const yearParam = url.searchParams.get('year');
        //error handling for year
        if (!yearParam) {
            throw new Error("Year parameter is required.");
        }
        const year = parseInt(yearParam, 10);
        if (isNaN(year)) {
            throw new Error("Invalid year parameter.");
        }

        //Initialize results object
        const results: CollectionData = {
            EmissionRates: [],  // Initialize as an empty array
            Equipment: [],
            Crops: [],
            Livestock: [],
            Waste: [],
            Forest: [],
        };

        //Loop through each collection to get data
        for (const collectionName of collections) { //each items in the collections list defined
            const collection = db.collection(collectionName);
            
            //Find documents matching the companyId (as ObjectId)
            const query = collectionName === 'EmissionRates' //if its this name then execute this
                ? {  } //no filter, get everything for calculations
                : {
                    company_id: objectId,
                    date: {
                        $gte: new Date(`${year}-01-01T00:00:00.000Z`),
                        $lt: new Date(`${year + 1}-01-01T00:00:00.000Z`)
                    }
                };
            const documents = await collection.find(query).toArray();
            //Store results in an object keyed by collection name
            switch (collectionName) {
                case 'EmissionRates':
                    results[collectionName] = documents as EmissionsRate[]; //Cast to EmissionsRate[]
                    break;
                case 'Equipment':
                    results[collectionName] = documents as Equipment[]; //Cast to Equipment[]
                    break;
                case 'Crops':
                    results[collectionName] = documents as Crop[]; //Cast to Crop[]
                    break;
                case 'Livestock':
                    results[collectionName] = documents as Livestock[]; //Cast to Livestock[]
                    break;
                case 'Waste':
                    results[collectionName] = documents as Waste[]; //Cast to Waste[]
                    break;
                case 'Forest':
                    results[collectionName] = documents as Forest[]; //Cast to Forest[]
                    break;
                default:
                    break;
            }        }
        //Return results
        //console.log(results); //test

        const carbonEmissionAverage = CalcluteMonthlyCarbonEmission(results.Equipment, results.Livestock, results.Crops, results.Waste, results.EmissionRates, results.Forest)
        return NextResponse.json(carbonEmissionAverage);

    } catch(error) {
        console.error("Error fetching data:", error);
        return NextResponse.json({ error: 'An error occurred while fetching data.' }, { status: 500 });
    }
}