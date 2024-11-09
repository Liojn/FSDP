import { NextResponse } from 'next/server';
import type { RoadmapData, Milestone } from '@/types/strategic';

export async function GET() {
  try {
    // Mock roadmap data - replace with actual database queries
    const roadmapData: RoadmapData = {
      milestones: [
        {
          id: '1',
          title: 'Initial Sustainability Assessment',
          description: 'Complete baseline sustainability assessment across all operations',
          dueDate: '2024-03-31',
          status: 'completed',
          progress: 100
        },
        {
          id: '2',
          title: 'Carbon Neutral Operations',
          description: 'Achieve carbon neutrality in direct operations',
          dueDate: '2024-12-31',
          status: 'pending',
          progress: 45
        },
        {
          id: '3',
          title: 'Sustainable Supply Chain',
          description: 'Implement sustainable practices across supply chain',
          dueDate: '2024-06-30',
          status: 'pending',
          progress: 60
        },
        {
          id: '4',
          title: 'Zero Waste Certification',
          description: 'Obtain zero waste certification for all facilities',
          dueDate: '2025-06-30',
          status: 'pending',
          progress: 20
        }
      ],
      dependencies: [
        { from: '1', to: '2' },
        { from: '1', to: '3' },
        { from: '2', to: '4' },
        { from: '3', to: '4' }
      ],
      criticalPath: ['1', '2', '4']
    };

    return NextResponse.json(roadmapData);
  } catch (error) {
    console.error('Error fetching roadmap data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch roadmap data' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const updates: { milestoneId: string; progress: number }[] = await request.json();
    
    // Mock milestone update logic - replace with actual database operations
    const updatedMilestones: Milestone[] = updates.map(update => ({
      id: update.milestoneId,
      title: `Updated Milestone ${update.milestoneId}`,
      description: 'Updated milestone description',
      dueDate: new Date().toISOString(),
      status: update.progress === 100 ? 'completed' : 'pending',
      progress: update.progress
    }));

    return NextResponse.json({ milestones: updatedMilestones });
  } catch (error) {
    console.error('Error updating roadmap:', error);
    return NextResponse.json(
      { error: 'Failed to update roadmap' },
      { status: 500 }
    );
  }
}
