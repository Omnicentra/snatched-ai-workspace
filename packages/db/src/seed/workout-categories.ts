import { db } from '../client'
import { workoutCategories } from '../schema'

export async function seedWorkoutCategories() {
  const categories = [
    {
      name: 'Full Body',
      description: 'Comprehensive workouts targeting all major muscle groups for total body conditioning and strength.',
    },
    {
      name: 'Lower Body',
      description: 'Focused workouts targeting legs, glutes, and lower body muscles for strength and shape.',
    },
    {
      name: 'Upper Body',
      description: 'Targeted exercises for arms, shoulders, chest, and back to build upper body strength and definition.',
    },
    {
      name: 'Core',
      description: 'Specialized workouts focusing on abdominal muscles, obliques, and lower back for core strength and stability.',
    },
    {
      name: 'HIIT',
      description: 'High-Intensity Interval Training combining bursts of intense exercise with recovery periods for maximum calorie burn.',
    },
  ] as const

  console.log('🌱 Seeding workout categories...')

  try {
    // check if categories already exist
    const existingCategories = await db.query.workoutCategories.findMany()
    if (existingCategories.length > 0) {
      console.log('🌱 Workout categories already exist, skipping seeding')
      return
    }
    // Insert categories one by one to handle unique constraint
    for (const category of categories) {
      await db.insert(workoutCategories).values(category).onConflictDoNothing()
    }
    
    console.log('✅ Successfully seeded workout categories')
  } catch (error) {
    if (error instanceof Error) {
      console.error('❌ Error seeding workout categories:', error.message)
    } else {
      console.error('❌ Error seeding workout categories:', String(error))
    }
    throw error
  }
} 