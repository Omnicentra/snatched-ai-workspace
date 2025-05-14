import { db } from '../client'
import { workoutCategories } from '../schema'
import { eq } from 'drizzle-orm'
export async function seedWorkoutCategories() {
  const categories = [
    {
      id: 1,
      name: 'Full Body',
      description: 'Comprehensive workouts targeting all major muscle groups for total body conditioning and strength.',
    },
    {
      id: 2,
      name: 'Lower Body',
      description: 'Focused workouts targeting legs, glutes, and lower body muscles for strength and shape.',
    },
    {
      id: 3,
      name: 'Upper Body',
      description: 'Targeted exercises for arms, shoulders, chest, and back to build upper body strength and definition.',
    },
    {
      id: 4,
      name: 'Core',
      description: 'Specialized workouts focusing on abdominal muscles, obliques, and lower back for core strength and stability.',
    },
    {
      id: 5,
      name: 'HIIT',
      description: 'High-Intensity Interval Training combining bursts of intense exercise with recovery periods for maximum calorie burn.',
    },
    {
      id: 6,
      name: 'Cardio',
      description: 'High-intensity workouts that focus on improving cardiovascular health and endurance.',
    },
    {
      id: 7,
      name: 'Recovery',
      description: 'Low-intensity workouts designed to promote relaxation and recovery, helping to prevent overtraining and injury.',
    },
  ] as const

  console.log('🌱 Seeding workout categories...')

  try {
    // Insert categories one by one to handle unique constraint
    for (const category of categories) {
      // check if category already exists
      const existingCategory = await db.query.workoutCategories.findFirst({
        where: eq(workoutCategories.name, category.name),
      })
      if (existingCategory) {
        console.log(`⚠️ Workout category "${category.name}" already exists, skipping seeding`)
        continue
      }
      await db.insert(workoutCategories).values(category).onConflictDoNothing()
      console.log(`🌱 Workout category "${category.name}" seeded`)
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