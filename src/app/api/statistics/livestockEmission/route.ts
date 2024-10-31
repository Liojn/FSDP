import { NextResponse } from 'next/server';
const { connectToDatabase } = require("../../../../../dbConfig");

export async function POST(req: Request) {
    interface LSentry {
        species: "Cattle" | "Goat" | "Pig" | "Chicken";
        number_of_species: number;
        date: string;
    }

    try {
        const db = await connectToDatabase();
        const userName = req.headers.get('userName');
        const { endYear, dataType} = await req.json();
        let companyId;

        const LSMonthlyData = {
            Cattle: Array(12).fill(0),
            Pig: Array(12).fill(0),
            Goat: Array(12).fill(0),
            Chicken: Array(12).fill(0),
        };

        if (userName) {
            const user = await db.collection('User').findOne({ name : userName});
            if (!user) {
                return NextResponse.json({error: 'User not found'}, {status: 404})
            }
            companyId = user._id;
        }

        const emissionRates = await db.collection('EmissionRates').findOne({});
        console.log("Fetched Emission Rates:", emissionRates);
        if (!emissionRates) {
            return NextResponse.json({ error: 'Emission rates not found' }, { status: 404 });
        }

        const LSData = await db.collection('Livestock').find({
        company_id: companyId,
        date: {
            $gte: new Date(`${endYear}-01-01`),
            $lt: new Date(`${endYear}-12-31`)
        }
        }).toArray();
        if (dataType === 'carbon-emissions') {
          LSData.forEach((entry: LSentry) => {
            const month = new Date(entry.date).getMonth(); // Get the month (0 = January, 11 = December)
            const species = entry.species as keyof typeof LSMonthlyData;
            const emissionRate = emissionRates.animal_emissions[species.toLowerCase()];
            const emission = (entry.number_of_species || 0) * (emissionRate || 0);

            if (LSMonthlyData[species]) {
            LSMonthlyData[species][month] += emission;
            }
        });
        } else if (dataType === 'energy-consumption') {
            LSData.forEach((entry: LSentry) => {
            const month = new Date(entry.date).getMonth(); // Get the month (0 = January, 11 = December)
            const species = entry.species as keyof typeof LSMonthlyData;
            LSMonthlyData[species][month] += 0;
            });
        }
        return NextResponse.json({ LSMonthlyData });
    } catch (error) {
      console.error("Error fetching livestock data:", error);
      return NextResponse.json({ error: 'Failed to fetch livestock data'}, {status: 500})
  }
}
