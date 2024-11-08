import { NextRequest, NextResponse } from 'next/server'
import dbConfig from 'dbConfig'
import { ObjectId } from 'mongodb'

export interface StrategicGoal {
  _id?: ObjectId
  title: string
  description?: string
  department?: string
  targetDate?: string
  progress?: number
  status?: string
  createdAt?: Date
  updatedAt?: Date
  milestones?: Milestone[]
}

export interface Milestone {
  _id?: ObjectId
  title: string
  description?: string
  targetDate: string
  completed: boolean
  completedAt?: Date
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const department = searchParams.get('department')
    const status = searchParams.get('status')

    const db = await dbConfig.connectToDatabase()
    const goalsCollection = db.collection('strategic_goals')

    // Build query object
    const query: Record<string, string> = {}
    if (department) query.department = department
    if (status) query.status = status

    const goals = await goalsCollection
      .find(query)
      .sort({ createdAt: -1 })
      .toArray()

    return NextResponse.json(goals, { status: 200 })
  } catch (error) {
    console.error('Error fetching goals:', error)
    return NextResponse.json(
      { error: 'Failed to fetch goals' }, 
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const goalData: StrategicGoal = await request.json()

    const db = await dbConfig.connectToDatabase()
    const goalsCollection = db.collection('strategic_goals')

    // Prepare goal object
    const newGoal: StrategicGoal = {
      ...goalData,
      createdAt: new Date(),
      updatedAt: new Date(),
      progress: goalData.progress ?? 0,
      status: goalData.status ?? 'Not Started'
    }

    const result = await goalsCollection.insertOne(newGoal)

    return NextResponse.json(
      { ...newGoal, _id: result.insertedId }, 
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating goal:', error)
    return NextResponse.json(
      { error: 'Failed to create goal' }, 
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, ...updateData } = await request.json()

    if (!id) {
      return NextResponse.json(
        { error: 'Goal ID is required' }, 
        { status: 400 }
      )
    }

    const db = await dbConfig.connectToDatabase()
    const goalsCollection = db.collection('strategic_goals')

    // Prepare update object
    const updateObject = {
      $set: {
        ...updateData,
        updatedAt: new Date()
      }
    }

    const result = await goalsCollection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      updateObject,
      { returnDocument: 'after' }
    )

    if (!result) {
      return NextResponse.json(
        { error: 'Goal not found' }, 
        { status: 404 }
      )
    }

    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    console.error('Error updating goal:', error)
    return NextResponse.json(
      { error: 'Failed to update goal' }, 
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Goal ID is required' }, 
        { status: 400 }
      )
    }

    const db = await dbConfig.connectToDatabase()
    const goalsCollection = db.collection('strategic_goals')

    const result = await goalsCollection.deleteOne({ 
      _id: new ObjectId(id) 
    })

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Goal not found' }, 
        { status: 404 }
      )
    }

    return NextResponse.json(
      { message: 'Goal deleted successfully' }, 
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting goal:', error)
    return NextResponse.json(
      { error: 'Failed to delete goal' }, 
      { status: 500 }
    )
  }
}
