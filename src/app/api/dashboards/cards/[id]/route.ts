import { NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from '@/../dbConfig'
const { ObjectId } = require('mongodb');

//List of Collections that we would be using
const collections = [
    'Crops',
    'Livestock',
    'Equipment',
    'Waste',
    'EmissionRates',
    'Forest'
]

// Define a type for the results object
type CollectionData = {
    [key: string]: any[]; // Use a more specific type if possible
};

//API route handler, for calculation of metrics for the 3 Cards
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try{
        const companyId = params.id;
        console.log(companyId.length); //test wheteher objectId is correct 24 hexa'

        //convert companyId to ObjectId
        const objectId = new ObjectId(companyId);
        //connect to MongoDB
        const db  = await connectToDatabase();
        if (!db) {
            throw new Error("Database connection failed."); //If no db instances is defined
        }

        const results: CollectionData = {}; // Specify the type here

        // Loop through each collection and fetch data based on companyId
        for (const collectionName of collections) {
            const collection = db.collection(collectionName);
            
            // Find documents matching the companyId (as ObjectId)
            const documents = await collection.find({ company_id: objectId }).toArray();
            
            // Store the result in an object keyed by collection name
            results[collectionName] = documents;
        }




    } catch {

    }
}