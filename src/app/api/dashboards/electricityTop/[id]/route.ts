import { NextRequest, NextResponse } from "next/server"
import  connectToDatabase  from '@/../dbConfig'
import { ObjectId } from 'mongodb';

type EquipmentConsumption = {
  name: string;
  consumption: number;
};

//API hanlder to get all the top 3 equipment and its consumption pattern.
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try{
         const companyId = params.id; // Obtain companyId

        // Convert companyId to ObjectId
        const objectId = new ObjectId(companyId);

        // Connect to MongoDB
        const db = await connectToDatabase.connectToDatabase();
        if (!db) {
        throw new Error("Database connection failed."); // If no db instances are defined
        }

        // Obtain year from query
        const url = new URL(request.url);
        const yearParam = url.searchParams.get('year');
        const monthParam = url.searchParams.get('month'); //query month not given if not needed

        // Error handling for year
        if (!yearParam) {
        throw new Error("Year parameter is required.");
        }

        const year = parseInt(yearParam, 10);
        if (isNaN(year)) {
        throw new Error("Invalid year parameter.");
        }

        // Handle month parameter
        let month;
        if (monthParam) {
        month = parseInt(monthParam, 10);
        if (isNaN(month) || month < 0 || month > 11) {
            throw new Error("Invalid month parameter. Must be between 0 and 11.");
        }
        } else {
        month = null; // If no month, get data for all months
        }

        // Query the "equipment_drilldown" for the specified companyId, year, and month(if given, in fetch url)
        const pipeline = [
        { $match: { company_id: objectId } },
        {
            $addFields: {
            year: { $year: "$date" },
            month: { $month: "$date" }
            }
        },
        {
            $match: {
            year,
            ...(month !== null && { month: month + 1 }) // MongoDB months are 1-based
            }
        },
        { $unwind: "$equipment_drilldown" },
        {
            $group: {
            _id: "$equipment_drilldown.equipment_name",
            totalConsumption: { $sum: "$equipment_drilldown.electricity_used" }
            }
        },
        {
            $project: {
            name: "$_id",
            consumption: "$totalConsumption",
            _id: 0
            }
        },
        { $sort: { consumption: -1 } }, // Sort by consumption in descending order
        { $limit: 3 } // Limit to top 3 results
        ];

        const equipmentData: EquipmentConsumption[] = await db.collection("Equipment").aggregate(pipeline).toArray();
        return NextResponse.json(equipmentData);

    }catch (error){
        console.error("Error fetching data:", error);
        return NextResponse.json({ error: 'An error occurred while fetching data.' }, { status: 500 });
    }
}
