import { NextRequest, NextResponse } from "next/server"
import  connectToDatabase  from '@/../dbConfig'
const { ObjectId } = require('mongodb');

type User = {
  _id: {
    $oid: string; // MongoDB ObjectId in string format
  };
  emissionGoal: EmissionGoal[]; // Array of emission goals for different years
};
type EmissionGoal = {
  year: number;
  target: number;
}

//API route handler, for calculation of carbon emissions by User
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try{
        const companyId = params.id; //obtain companyId
        // console.log(companyId.length); //test wheteher objectId is correct 24 hexa
        
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

        //Query from mongodb
        const userCollection = db.collection("User");
        const user = await userCollection
        .findOne({ _id: objectId }, { projection: { emissionGoal: 1 } }); // Only return emissionGoal

        if (!user) {
        throw new Error("User not found.");
        }
        // Find the emission target for the requested year
        const emissionGoalForYear = (user.emissionGoal as EmissionGoal[]).find(
            (goal) => goal.year === year
        );

        if (emissionGoalForYear) {
            // Return the target for the year
            return NextResponse.json({ target: emissionGoalForYear.target });
        } else {
            // If no target found for the year, return default 10000
            return NextResponse.json({ target: 10000 });
        }
    }
   catch (error) {
        return NextResponse.json({ error: "An error occurred while fetching data" }, { status: 500 });
    }
}