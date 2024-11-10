import { NextRequest, NextResponse } from "next/server"
import connectToDatabase from '@/../dbConfig'
import { ObjectId } from 'mongodb';

// API Route Handler, logic for getting the year eg. http://localhost:3000/api/dashboards/trackyear/671cf9a6e994afba6c2f332d
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  
  try {
    const companyId = params.id;
    // console.log(companyId.length); //test wheteher objectId is correct 24 hexa'

    //convert companyId to ObjectId
    const objectId = new ObjectId(companyId);
    //connect to MongoDB
    const db  = await connectToDatabase.connectToDatabase();

    if (!db) {
        throw new Error("Database connection failed."); //If no db instances is defined
    }

    const collection = db.collection("Equipment"); //Use Equipment, monitors the usage of electricity

    // console.log("Company ID:", objectId); //test

    const equipmentData = await collection.find(
      { company_id: objectId }, 
      { projection: { date: 1 } } //extract the _id and the date corresponding to the company_id
    ).toArray();

    // console.log("Equipment Data:", equipmentData); //test purposes

    //Extract unique years from the date field
    const yearsSet = new Set<number>(); //Set allows only adding of unique value
    
    for (const item of equipmentData) {
        const year = new Date(item.date).getFullYear(); //Get the year from the date
        yearsSet.add(year); // Add the year to the Set
    }
      
    //Convert the Set back to an array and sort it
    const uniqueYears = Array.from(yearsSet).sort((a, b) => b - a); // Sort in descending order to get latest on top
    // console.log(uniqueYears) //test
    // Return unique years as JSON
    return NextResponse.json(uniqueYears);

  } catch (error) {
    console.error("Error fetching years:", error);
    return NextResponse.json({ error: "Failed to fetch available years" }, { status: 500 });
  }
}
