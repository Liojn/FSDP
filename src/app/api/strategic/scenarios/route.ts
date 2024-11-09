import { NextResponse } from 'next/server';
import type { Scenario } from '@/types/strategic';

export async function GET() {
  try {
    const scenarios: Scenario[] = [
      {
        id: '1',
        name: 'Accelerated Sustainability',
        description: 'Aggressive sustainability targets with increased investment',
        assumptions: [
          'Carbon tax increases by 20%',
          'Renewable energy costs decrease by 30%',
          'Supply chain partners adopt green practices'
        ],
        projectedOutcomes: [
          {
            metric: 'Carbon Emissions',
            value: 800,
            confidence: 0.85
          },
          {
            metric: 'Renewable Energy Usage',
            value: 75,
            confidence: 0.9
          }
        ],
        recommendations: [
          'Increase renewable energy investment',
          'Implement supply chain emissions tracking',
          'Expand carbon offset programs'
        ]
      }
    ];

    return NextResponse.json(scenarios);
  } catch (error) {
    console.error('Error fetching scenarios:', error);
    return NextResponse.json(
      { error: 'Failed to fetch scenarios' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const newScenario = await request.json();
    
    // Mock creating a new scenario - replace with actual database operation
    const createdScenario: Scenario = {
      id: Date.now().toString(),
      ...newScenario
    };

    return NextResponse.json(createdScenario);
  } catch (error) {
    console.error('Error creating scenario:', error);
    return NextResponse.json(
      { error: 'Failed to create scenario' },
      { status: 500 }
    );
  }
}
