import { NextRequest, NextResponse } from "next/server";
import  connectToDatabase  from '@/../dbConfig';
import { ObjectId } from 'mongodb';

// List of collections that we would be using
const collections = [
    'Crops',
    'Livestock',
    'Equipment',
    'Waste',
    'EmissionRates',
    'Forest'
];

// Define a type for the results object
type CollectionData = {
    [key: string]: any[]; // Use a more specific type if possible
};

// API route handler, for calculation of metrics for the 3 Cards
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        // Ensure params and params.id are defined
        const companyId = params?.id;
        if (!companyId) {
            return NextResponse.json(
                { error: "Missing or invalid ID parameter." },
                { status: 400 }
            );
        }

        // Print companyId to verify it
        console.log("Received params:", params);

        // Check if companyId has a valid length for MongoDB ObjectId
        if (companyId.length !== 24) {
            return NextResponse.json(
                { error: "Invalid company ID length." },
                { status: 400 }
            );
        }

        // Convert companyId to ObjectId
        const objectId = new ObjectId(companyId);

        // Connect to MongoDB
        const db = await connectToDatabase.connectToDatabase();
        if (!db) {
            throw new Error("Database connection failed."); // If no db instance is defined
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

        // Return the results as JSON
        return NextResponse.json(results, { status: 200 });
    } catch (error) {
        console.error("Error in achievements API:", error);

        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

