import { NextResponse } from 'next/server';
import type { ProgressData } from '@/types/strategic';

export async function GET() {
  try {
    // Mock data for demonstration - replace with actual database calls
    const progressData: ProgressData = {
      milestones: [
        {
          id: '1',
          title: 'Carbon Neutral Operations',
          description: 'Achieve carbon neutrality across all operations',
          dueDate: '2024-12-31',
          status: 'pending',
          progress: 45
        },
        {
          id: '2',
          title: 'Sustainable Supply Chain',
          description: 'Implement sustainable practices across supply chain',
          dueDate: '2024-06-30',
          status: 'pending',
          progress: 60
        }
      ],
      metrics: [
        {
          id: '1',
          name: 'Carbon Emissions',
          value: 1200,
          target: 1000,
          unit: 'tons CO2e',
          trend: 'decreasing'
        },
        {
          id: '2',
          name: 'Renewable Energy Usage',
          value: 35,
          target: 50,
          unit: 'percentage',
          trend: 'increasing'
        }
      ],
      lastUpdated: new Date().toISOString()
    };

    return NextResponse.json(progressData);
  } catch (error) {
    console.error('Error fetching progress data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch progress data' },
      { status: 500 }
    );
  }
}
