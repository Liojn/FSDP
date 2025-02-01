import { NextRequest, NextResponse } from "next/server"
import  connectToDatabase  from '@/../dbConfig'
import { ObjectId } from 'mongodb';

type EmissionGoal = {
  year: number;
  target: number;
}

//API route handler, for calculation of carbon emissions by User
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try{
        const companyId = params.id; //obtain companyId
        console.log(companyId.length); //test wheteher objectId is correct 24 hexa
        
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
        .findOne({ _id: objectId }, { projection: { emissionGoal: 1, firstYearGoal: 1} }); // Only return emissionGoal and firstYearGoal

        if (!user) {
        throw new Error("User not found.");
        }

        // Assert the type of user to User
        const userTyped = user as User;


        // Find the emission target for the requested year
        const emissionGoalForYear = userTyped.emissionGoal.find((goal) => goal.year === year);

         if (emissionGoalForYear) {
            // Check if it's the earliest year
            const earliestYear = Math.min(...user.emissionGoal.map((goal: EmissionGoal) => goal.year));
            const isEarliestYear = emissionGoalForYear.year === earliestYear;

            return NextResponse.json({
                target: emissionGoalForYear.target,
                isEarliestYear: isEarliestYear,
                firstYearGoal: isEarliestYear ? user.firstYearGoal : 10000
            });
        } else {
        // If no target found for the year, return default values
        return NextResponse.json({
            target: 10000,
            isEarliestYear: false,
            firstYearGoal: null
        });
    }
  } catch (error) {
    console.error(error); // Log the error
    return NextResponse.json({ error: "An error occurred while fetching data" }, { status: 500 });
    }
}