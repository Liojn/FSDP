import { NextRequest, NextResponse } from "next/server"
import connectToDatabase  from '@/../dbConfig'
import { ObjectId } from 'mongodb';

//List of Collections that we would be using
const collections = [
    'Crops',
    'EmissionRates',
    'IndonesiaWeather'
]

// Type for Crops
type Crop = {
    _id: { $oid: string };
    company_id: { $oid: string };
    crop_type: string;
    status: string;
    area_planted_ha: number;
    fertilizer_amt_used_kg: number,
    date: string ;
};


// Type for Weather 
type IndonesiaWeather = {
  _id: { $oid: string; };
  date: string ;
  temperature: number; 
  rainfall: number; 
  wind_speed: number; 
  location: string; 
};

//Type for Emission Rate
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

// Define the CollectionData type to encapsulate all collections
type CollectionData = {
    EmissionRates: EmissionsRate[]; //Array of EmissionRate objects
    Crops: Crop[];                 //Array of Crop objects
    IndonesiaWeather: IndonesiaWeather[];
};
type CropCycleData = {
  month: string;
  phase: string;
  burnRisk: 'Low' | 'Medium' | 'High';
  crops: { type: string }[];  // Array of crop types
  temperature: number;
};


//Function for calculation
function formatCropCycleData(cropData: Crop[], emissionRateData: EmissionsRate[], weatherData: IndonesiaWeather[]): CropCycleData[] {
    const monthlyArray = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const ReturnArray: CropCycleData[] = [];  // Use the defined type here

    for (const crop of cropData) {
        const cropType = crop.crop_type;
        const month = new Date(crop.date).getUTCMonth();
        const status = crop.status;

        for (const weather of weatherData) {
            const currentMonth = new Date(weather.date).getUTCMonth();
            if (currentMonth === month) {
                const rainfall = weather.rainfall;
                const temperature = weather.temperature;
                const wind_speed = weather.wind_speed;

                // Calculate risk and append
                const temperatureRisk = temperature > 28 ? 1 : temperature > 26 ? 0.5 : 0;
                const rainfallRisk = rainfall < 3 ? 1 : rainfall < 20 ? 0.5 : 0;
                const windSpeedRisk = wind_speed > 8 ? 1 : wind_speed > 3 ? 0.5 : 0;
                const weatherScore = (temperatureRisk * 0.35) + (rainfallRisk * 0.20) + (windSpeedRisk * 0.15);
                let cropcycleRisk;
                if (status === "Land Preparation") {
                    cropcycleRisk = 1;
                } else if (status === "Harvesting") {
                    cropcycleRisk = 0.5;
                } else {
                    cropcycleRisk = 0;
                }

                const cropCycleScore = cropcycleRisk * 0.30;
                const totalRiskPercentage = (weatherScore + cropCycleScore) * 100;

                let burnRisk: 'Low' | 'Medium' | 'High' = 'Low';
                if (totalRiskPercentage > 60) {
                    burnRisk = 'High';
                } else if (totalRiskPercentage > 30) {
                    burnRisk = 'Medium';
                }

                // Check if the month already exists in ReturnArray
                const existingMonth = ReturnArray.find(entry => entry.month === monthlyArray[month]);
                if (existingMonth) {
                    // Append the new crop to the existing month's crops array
                    existingMonth.crops.push({ type: cropType });
                } else {
                    // Create a new entry for the month
                    const insertedObject: CropCycleData = {
                        month: monthlyArray[month],
                        phase: status,
                        burnRisk,
                        crops: [
                            { type: cropType },
                        ],
                        temperature: temperature,
                    };
                    ReturnArray.push(insertedObject);
                }
            }
        }
    }

    // Arrange by Jan to Dec
    ReturnArray.sort((a, b) => monthlyArray.indexOf(a.month) - monthlyArray.indexOf(b.month));
    return ReturnArray;
}


//Type FOR THE QUERY
type EmissionRatesQuery = Record<string, never>; // Ensures no properties allowed, No filter for this collection
type IndonesiaWeatherQuery = {
  location: { $regex: string, $options: string },
  date: { $gte: Date, $lt: Date }
};
type DefaultQuery = {
  company_id: ObjectId,
  date: { $gte: Date, $lt: Date }
};

type Query = EmissionRatesQuery | IndonesiaWeatherQuery | DefaultQuery;

//API route handler, for calculation of metrics for the 3 Cards
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try{
        const companyId = params.id; //obtain companyId
        //console.log(companyId.length); //test wheteher objectId is correct 24 hexa
        
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

        // Obtain location from query
        const locationParam = url.searchParams.get('location');

        // Error handling for location (if required, can be optional)
        if (!locationParam) {
            throw new Error("Location parameter is required.");
        }
        console.log(locationParam);


         //Initialize results object
        const results: CollectionData = {
            EmissionRates: [],  // Initialize as an empty array
            Crops: [],
            IndonesiaWeather: [],
        };

        //Loop through each collection to get data
        for (const collectionName of collections) { //each items in the collections list defined
            const collection = db.collection(collectionName);

            // Define the base query
            let query: Query;

            if (collectionName === 'EmissionRates') {
                // No filter, get everything for calculations
                query = {};
            } else if (collectionName === 'IndonesiaWeather') {
                query = {
                            location: { $regex: locationParam, $options: 'i' }, // Case-insensitive regex search
                            date: {
                                $gte: new Date(`${year}-01-01T00:00:00.000Z`), // Start of the year
                                $lt: new Date(`${year + 1}-01-01T00:00:00.000Z`), // Start of the next year
                            },
                        };
            } else {
                // Query for other collections (e.g., Crops)
                query = {
                    company_id: objectId,
                    date: {
                        $gte: new Date(`${year}-01-01T00:00:00.000Z`),
                        $lt: new Date(`${year + 1}-01-01T00:00:00.000Z`),
                    },
                };
            }

            // Execute the query
            const documents = await collection.find(query).toArray();
            //console.log(documents);
            //Store results in an object keyed by collection name
            switch (collectionName) {
                case 'EmissionRates':
                    results[collectionName] = documents as EmissionsRate[]; //Cast to EmissionsRate[]
                    break;
                case 'Crops':
                    results[collectionName] = documents as Crop[]; //Cast to Crop[]
                    break;
                case 'IndonesiaWeather':
                    results[collectionName] = documents as IndonesiaWeather[];
                    break;
                default:
                    break;
            }  
        }
        const cropCycleData = formatCropCycleData(results.Crops, results.EmissionRates, results.IndonesiaWeather)
        return NextResponse.json(cropCycleData);
    } catch (error) {
        console.error("Error fetching data:", error);
        return NextResponse.json({ error: 'An error occurred while fetching data for crop cycle.' }, { status: 500 });
    }
}