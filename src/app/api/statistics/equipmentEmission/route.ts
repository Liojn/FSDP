import { NextResponse } from 'next/server';
import  connectToDatabase  from "@/../dbConfig";

export async function POST(req: Request) {
    try {
        const db = await connectToDatabase.connectToDatabase();
        const userName = req.headers.get('userName');
        const { endYear, dataType } = await req.json();
        let companyId;

        // Initialize the monthly data object for Equipment with separate arrays for each emission type
        const equipmentMonthlyData = {
            dieselEmissions: Array(12).fill(0),
            propaneEmissions: Array(12).fill(0),
            naturalGasEmissions: Array(12).fill(0),
            biodieselEmissions: Array(12).fill(0),
            gasolineEmissions: Array(12).fill(0),
            electricityEmissions: Array(12).fill(0),
            energyConsumption: Array(12).fill(0),
        };

        // Get the user and their companyId
        if (userName) {
            const user = await db.collection('User').findOne({ name: userName });
            if (!user) {
                return NextResponse.json({ error: 'User not found' }, { status: 404 });
            }
            companyId = user._id;
        }

        // Get the emission rates
        const emissionRates = await db.collection('EmissionRates').findOne({});
        console.log("Fetched Emission Rates:", emissionRates);
        if (!emissionRates) {
            return NextResponse.json({ error: 'Emission rates not found' }, { status: 404 });
        }

        // Retrieve Equipment data for the specified year and company
        const equipmentData = await db.collection('Equipment').find({
            company_id: companyId,
            date: {
                $gte: new Date(`${endYear}-01-01`),
                $lt: new Date(`${endYear}-12-31`)
            }
        }).toArray();
        
        console.log("Fetched Equipment Data:", equipmentData);

        // Process the Equipment data based on the dataType
        equipmentData.forEach((item) => {
            const month = new Date(item.date).getMonth(); // Get the month (0 = January, 11 = December)
            
            if (dataType === 'carbon-emissions') {
                // Map the fuel_type from Equipment data to the keys in equipmentMonthlyData
                let fuelEmission = 0;
                
                switch (item.fuel_type) {
                    case "Diesel":
                        fuelEmission = (item.fuel_consumed_l || 0) * (emissionRates.fuel_emissions.diesel || 0);
                        equipmentMonthlyData.dieselEmissions[month] += fuelEmission;
                        break;
                    case "Propane":
                        fuelEmission = (item.fuel_consumed_l || 0) * (emissionRates.fuel_emissions.propane || 0);
                        equipmentMonthlyData.propaneEmissions[month] += fuelEmission;
                        break;
                    case "Natural Gas":
                        fuelEmission = (item.fuel_consumed_l || 0) * (emissionRates.fuel_emissions.naturalgas || 0);
                        equipmentMonthlyData.naturalGasEmissions[month] += fuelEmission;
                        break;
                    case "Biodiesel":
                        fuelEmission = (item.fuel_consumed_l || 0) * (emissionRates.fuel_emissions.biodiesel || 0);
                        equipmentMonthlyData.biodieselEmissions[month] += fuelEmission;
                        break;
                    case "Gasoline":
                        fuelEmission = (item.fuel_consumed_l || 0) * (emissionRates.fuel_emissions.gasoline || 0);
                        equipmentMonthlyData.gasolineEmissions[month] += fuelEmission;
                        break;
                    default:
                        console.warn(`Unknown fuel type: ${item.fuel_type}`);
                        break;
                }

                // Calculate electricity emissions if electricity data exists
                const electricityEmissionRate = emissionRates.energy.electricity_emission;
                const electricityEmission = (item.total_electricity_used_kWh || 0) * (electricityEmissionRate || 0);
                equipmentMonthlyData.electricityEmissions[month] += electricityEmission;

            } else if (dataType === 'energy-consumption') {
                // Sum the total electricity used for energy consumption
                equipmentMonthlyData.energyConsumption[month] += item.total_electricity_used_kWh || 0;
            }
        });

        return NextResponse.json({ equipmentMonthlyData });
    } catch (error) {
        console.error("Error fetching equipment data:", error);
        return NextResponse.json({ error: 'Failed to fetch equipment data' }, { status: 500 });
    }
}
