import { StrategicGoal } from '@/app/api/goals/route'

export function validateGoal(goal: Partial<StrategicGoal>): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  // Title validation
  if (!goal.title || goal.title.trim().length < 3) {
    errors.push('Title must be at least 3 characters long')
  }

  // Department validation
  const validDepartments = ['Sustainability', 'Operations', 'Facilities', 'Energy', 'Finance']
  if (goal.department && !validDepartments.includes(goal.department)) {
    errors.push(`Department must be one of: ${validDepartments.join(', ')}`)
  }

  // Progress validation
  if (goal.progress !== undefined) {
    if (typeof goal.progress !== 'number' || goal.progress < 0 || goal.progress > 100) {
      errors.push('Progress must be a number between 0 and 100')
    }
  }

  // Status validation
  const validStatuses = ['Not Started', 'In Progress', 'Completed']
  if (goal.status && !validStatuses.includes(goal.status)) {
    errors.push(`Status must be one of: ${validStatuses.join(', ')}`)
  }

  // Target date validation
  if (goal.targetDate) {
    const targetDate = new Date(goal.targetDate)
    if (isNaN(targetDate.getTime())) {
      errors.push('Invalid target date format')
    } else if (targetDate < new Date()) {
      errors.push('Target date must be in the future')
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}
