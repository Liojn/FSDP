import { NextResponse } from 'next/server';
import type { DepartmentBenchmark } from '@/types/strategic';

export async function GET(
  request: Request,
  { params }: { params: { department: string } }
) {
  try {
    const department = params.department;
    
    // Mock benchmark data - replace with actual database/analytics queries
    const benchmarkData: DepartmentBenchmark = {
      metrics: [
        {
          id: '1',
          name: 'Carbon Emissions',
          value: department === 'manufacturing' ? 1200 : 800,
          target: 1000,
          unit: 'tons CO2e',
          trend: 'decreasing'
        },
        {
          id: '2',
          name: 'Renewable Energy Usage',
          value: department === 'facilities' ? 45 : 35,
          target: 50,
          unit: 'percentage',
          trend: 'increasing'
        },
        {
          id: '3',
          name: 'Waste Reduction',
          value: department === 'operations' ? 25 : 20,
          target: 30,
          unit: 'percentage',
          trend: 'increasing'
        }
      ],
      industryAverage: getDepartmentIndustryAverage(department),
      topPerformer: getDepartmentTopPerformer(department),
      recommendations: getDepartmentRecommendations(department)
    };

    return NextResponse.json(benchmarkData);
  } catch (error) {
    console.error('Error fetching benchmark data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch benchmark data' },
      { status: 500 }
    );
  }
}

function getDepartmentIndustryAverage(department: string): number {
  // Mock industry averages - replace with actual data
  const averages: Record<string, number> = {
    manufacturing: 1500,
    facilities: 1200,
    operations: 1000,
    logistics: 800,
    default: 1000
  };
  
  return averages[department] || averages.default;
}

function getDepartmentTopPerformer(department: string): number {
  // Mock top performer metrics - replace with actual data
  const topPerformers: Record<string, number> = {
    manufacturing: 800,
    facilities: 600,
    operations: 500,
    logistics: 400,
    default: 500
  };
  
  return topPerformers[department] || topPerformers.default;
}

function getDepartmentRecommendations(department: string): string[] {
  // Mock department-specific recommendations - replace with actual analysis
  const recommendations: Record<string, string[]> = {
    manufacturing: [
      'Implement energy-efficient manufacturing processes',
      'Upgrade to smart manufacturing equipment',
      'Optimize production schedules for energy efficiency'
    ],
    facilities: [
      'Install renewable energy systems',
      'Implement smart building management systems',
      'Upgrade to energy-efficient lighting and HVAC'
    ],
    operations: [
      'Optimize resource allocation',
      'Implement lean operational practices',
      'Develop waste reduction programs'
    ],
    logistics: [
      'Optimize delivery routes',
      'Transition to electric vehicles',
      'Implement sustainable packaging'
    ],
    default: [
      'Conduct sustainability assessment',
      'Develop department-specific sustainability goals',
      'Implement monitoring and reporting systems'
    ]
  };
  
  return recommendations[department] || recommendations.default;
}
