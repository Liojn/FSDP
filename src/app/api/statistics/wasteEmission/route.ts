import { NextResponse } from 'next/server';
const { connectToDatabase } = require("../../../../../dbConfig");

export async function POST(req: Request) {
    try {
        const db = await connectToDatabase();
        const userName = req.headers.get('userName');
        const { endYear, dataType } = await req.json();
        let companyId;

        // Initialize the monthly data object for waste emissions
        const wasteMonthlyData = {
            manure: Array(12).fill(0),
            yardWaste: Array(12).fill(0),
        };

        // Get the user and their companyId
        if (userName) {
            const user = await db.collection('User').findOne({ name: userName });
            if (!user) {
                return NextResponse.json({ error: 'User not found' }, { status: 404 });
            }
            companyId = user._id;
        }

        // Get the emission rates for waste
        const emissionRates = await db.collection('EmissionRates').findOne({});
        if (!emissionRates || !emissionRates.waste_emissions) {
            return NextResponse.json({ error: 'Waste emission rates not found' }, { status: 404 });
        }

        // Retrieve Waste data for the specified year and company
        const wasteData = await db.collection('Waste').find({
            company_id: companyId,
            date: {
                $gte: new Date(`${endYear}-01-01`),
                $lt: new Date(`${endYear}-12-31`)
            }
        }).toArray();

        // Process the Waste data based on dataType
        if (dataType === 'carbon-emissions') {
            wasteData.forEach((item) => {
                const month = new Date(item.date).getMonth(); // Get the month (0 = January, 11 = December)

                // Calculate emissions for each waste type if emission rate exists
                if (item.waste_type === 'Manure') {
                    wasteMonthlyData.manure[month] += (item.waste_quantity_kg || 0) * (emissionRates.waste_emissions.manure || 0);
                } else if (item.waste_type === 'Yard Waste') {
                    wasteMonthlyData.yardWaste[month] += (item.waste_quantity_kg || 0) * (emissionRates.waste_emissions.yard_waste || 0);
                }
            });
        } else if (dataType === 'energy-consumption') {
            // Set everything to 0 for energy-consumption
            wasteMonthlyData.manure = Array(12).fill(0);
            wasteMonthlyData.yardWaste = Array(12).fill(0);
        }

        return NextResponse.json({ wasteMonthlyData });
    } catch (error) {
        console.error("Error fetching waste emissions data:", error);
        return NextResponse.json({ error: 'Failed to fetch waste emissions data' }, { status: 500 });
    }
}
