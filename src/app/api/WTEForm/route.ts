import { NextResponse } from 'next/server';
import connectToDatabase from "dbConfig";

export async function POST(req: Request) {
  try {
    // Connect to the database
    const db = await connectToDatabase.connectToDatabase();
    
    // Get request body and headers
    const { tracking_id, weight_tons } = await req.json();
    const userName = req.headers.get('userName');

    // Validate required fields
    if (!userName || !tracking_id || !weight_tons) {
      return NextResponse.json({ 
        error: 'Missing required fields (userName in headers, tracking_id and weight_tons in body)' 
      }, { status: 400 });
    }

    // Get company_id from User collection
    const user = await db.collection('User').findOne({ name: userName });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Generate unique shipment_id
    // Find the highest existing shipment number
    const lastShipment = await db.collection('WTEData')
      .find({}, { shipment_id: 1 })
      .sort({ shipment_id: -1 })
      .limit(1)
      .toArray();

    let nextNumber = 2383; // Default starting number
    if (lastShipment.length > 0) {
      const lastNumber = parseInt(lastShipment[0].shipment_id.split('-')[1]);
      if (!isNaN(lastNumber)) {
        nextNumber = lastNumber + 1;
      }
    }
    const shipment_id = `WTE-${nextNumber}`;

    
    // Create new WTE data document
    const newWTEData = {
      company_id: user._id,
      shipment_id,
      weight_tons: Number(weight_tons),
      status: "In Progress",
      date_sent: new Date(), // Store as Date object directly
      tracking_id,
    };

    // Insert into database
    const result = await db.collection('WTEData').insertOne(newWTEData);

    if (!result.insertedId) {
      throw new Error('Failed to insert data');
    }

    // Return success response with the created record
    return NextResponse.json({
      message: 'WTE data created successfully',
      data: { ...newWTEData, id: result.insertedId }
    }, { status: 201 });

  } catch (error) {
    console.error("Error creating WTE data:", error);
    return NextResponse.json({ 
      error: 'Failed to create WTE data' 
    }, { status: 500 });
  }
}