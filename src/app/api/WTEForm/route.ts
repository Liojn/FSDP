import { NextResponse } from 'next/server';
import connectToDatabase from "dbConfig";

export async function POST(req: Request) {
  try {
    const db = await connectToDatabase.connectToDatabase();
    
    // Get request body and headers
    const { tracking_id, weight_tons, waste_category, transport_mode } = await req.json();
    const userName = req.headers.get('userName');

    // Enhanced validation
    if (!userName || !tracking_id || !weight_tons || !waste_category || waste_category.length === 0) {
      return NextResponse.json({ 
        error: 'Missing required fields' 
      }, { status: 400 });
    }

    // Validate weight_tons is positive
    if (weight_tons <= 0) {
      return NextResponse.json({ 
        error: 'Weight must be greater than 0' 
      }, { status: 400 });
    }

    // Get user and company info
    const user = await db.collection('User').findOne({ name: userName });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Generate shipment ID
    const lastShipment = await db.collection('WTEData')
      .find({}, { shipment_id: 1 })
      .sort({ shipment_id: -1 })
      .limit(1)
      .toArray();

    let nextNumber = 2383;
    if (lastShipment.length > 0) {
      const lastNumber = parseInt(lastShipment[0].shipment_id.split('-')[1]);
      if (!isNaN(lastNumber)) {
        nextNumber = lastNumber + 1;
      }
    }
    const shipment_id = `WTE-${nextNumber}`;

    // Calculate energy generation based on waste type
    let energyMultiplier = 433; // Base multiplier
    if (waste_category.includes('organic')) energyMultiplier *= 1.2; // 20% more efficient
    if (waste_category.includes('process')) energyMultiplier *= 1.1; // 10% more efficient
    if (waste_category.includes('animal')) energyMultiplier *= 1.3; // 30% more efficient
    
    const estimatedEnergyKwh = weight_tons * energyMultiplier;
    
    // Calculate carbon credits (1 credit per 100 kWh)
    const carbonCredits = Math.floor(estimatedEnergyKwh / 100);
    
    // Create enhanced WTE data document
    const newWTEData = {
      company_id: user._id,
      shipment_id,
      tracking_id,
      weight_tons: Number(weight_tons),
      waste_category,
      transport_mode,
      status: "In Progress",
      date_sent: new Date(),
      energy_generated_kwh: estimatedEnergyKwh,
      rate_cents_per_kwh: 18.5, // Current Singapore electricity rate
      total_energy_value_sgd: (estimatedEnergyKwh * 0.185), // Value in SGD
      carbon_credits: carbonCredits,
      compensation_sgd: (estimatedEnergyKwh * 0.185 * 0.3), // 30% compensation rate
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