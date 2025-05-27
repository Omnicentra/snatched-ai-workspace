import { db } from '../client'
import { workouts, workoutCategories } from '../schema'
import { eq } from 'drizzle-orm'

export async function seedGymWorkouts() {
  console.log('💪 Seeding gym workouts...')

  try {
    // First, get all category IDs
    const categories = await db.select().from(workoutCategories)
    const categoryMap = new Map(categories.map(cat => [cat.name, cat.id]))

    const workoutData = [
      // Strength Training - Full Body
      {
        title: 'Full Body Power',
        description: 'A comprehensive strength training workout targeting all major muscle groups with compound movements.',
        durationMinutes: 60,
        difficultyLevel: 'advanced',
        caloriesBurn: 500,
        rating: '4.8',
        imageUrl: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438',
        categoryId: categoryMap.get('Full Body'),
      },
      {
        title: 'Beginner Full Body',
        description: 'An introductory full body workout focusing on proper form and basic compound movements.',
        durationMinutes: 45,
        difficultyLevel: 'beginner',
        caloriesBurn: 350,
        rating: '4.6',
        imageUrl: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155',
        categoryId: categoryMap.get('Full Body'),
      },

      // Upper Body Focus
      {
        title: 'Upper Body Push Power',
        description: 'Intense upper body workout focusing on pushing movements for chest, shoulders, and triceps.',
        durationMinutes: 50,
        difficultyLevel: 'advanced',
        caloriesBurn: 400,
        rating: '4.7',
        imageUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e',
        categoryId: categoryMap.get('Upper Body'),
      },
      {
        title: 'Back & Biceps Blast',
        description: 'Focused pulling workout for back thickness and bicep development.',
        durationMinutes: 45,
        difficultyLevel: 'intermediate',
        caloriesBurn: 380,
        rating: '4.6',
        imageUrl: 'https://images.unsplash.com/photo-1598266663439-2056e7d8f93d',
        categoryId: categoryMap.get('Upper Body'),
      },

      // Lower Body Focus
      {
        title: 'Leg Day Power',
        description: 'High-intensity lower body workout focusing on strength and muscle development.',
        durationMinutes: 55,
        difficultyLevel: 'advanced',
        caloriesBurn: 450,
        rating: '4.9',
        imageUrl: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155',
        categoryId: categoryMap.get('Lower Body'),
      },
      {
        title: 'Glute Builder',
        description: 'Targeted workout for glute development and overall lower body strength.',
        durationMinutes: 40,
        difficultyLevel: 'intermediate',
        caloriesBurn: 350,
        rating: '4.8',
        imageUrl: 'https://images.unsplash.com/photo-1534258936925-c58bed479fcb',
        categoryId: categoryMap.get('Lower Body'),
      },

      // Core Focus
      {
        title: 'Core Strength & Power',
        description: 'Advanced core workout incorporating dynamic and static exercises.',
        durationMinutes: 30,
        difficultyLevel: 'advanced',
        caloriesBurn: 300,
        rating: '4.7',
        imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b',
        categoryId: categoryMap.get('Core'),
      },
      {
        title: 'Foundation Core',
        description: 'Build core strength and stability with fundamental exercises.',
        durationMinutes: 25,
        difficultyLevel: 'beginner',
        caloriesBurn: 200,
        rating: '4.5',
        imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b',
        categoryId: categoryMap.get('Core'),
      },

      // HIIT/Conditioning
      {
        title: 'Power HIIT',
        description: 'High-intensity interval training combining strength and cardio.',
        durationMinutes: 35,
        difficultyLevel: 'advanced',
        caloriesBurn: 450,
        rating: '4.9',
        imageUrl: 'https://images.unsplash.com/photo-1599058945522-28d584b6f0ff',
        categoryId: categoryMap.get('HIIT'),
      },
      {
        title: 'Beginner HIIT',
        description: 'Introduction to high-intensity interval training with modified exercises.',
        durationMinutes: 25,
        difficultyLevel: 'beginner',
        caloriesBurn: 300,
        rating: '4.6',
        imageUrl: 'https://images.unsplash.com/photo-1599058945522-28d584b6f0ff',
        categoryId: categoryMap.get('HIIT'),
      },

      // Strength & Power
      {
        title: 'Powerlifting Basics',
        description: 'Focus on the fundamental powerlifting movements for strength development.',
        durationMinutes: 70,
        difficultyLevel: 'intermediate',
        caloriesBurn: 450,
        rating: '4.8',
        imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48',
        categoryId: categoryMap.get('Full Body'),
      },
      {
        title: 'Athletic Power',
        description: 'Explosive movement training for athletic performance.',
        durationMinutes: 50,
        difficultyLevel: 'advanced',
        caloriesBurn: 400,
        rating: '4.7',
        imageUrl: 'https://images.unsplash.com/photo-1599058945522-28d584b6f0ff',
        categoryId: categoryMap.get('HIIT'),
      },

      // Specialized Workouts
      {
        title: 'Shoulder Sculptor',
        description: 'Detailed shoulder workout for strength and aesthetics.',
        durationMinutes: 45,
        difficultyLevel: 'intermediate',
        caloriesBurn: 350,
        rating: '4.6',
        imageUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e',
        categoryId: categoryMap.get('Upper Body'),
      },
      {
        title: 'Functional Strength',
        description: 'Build practical strength with functional movement patterns.',
        durationMinutes: 50,
        difficultyLevel: 'intermediate',
        caloriesBurn: 400,
        rating: '4.7',
        imageUrl: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438',
        categoryId: categoryMap.get('Full Body'),
      },

      // Recovery/Light Workouts
      {
        title: 'Active Recovery',
        description: 'Light workout for recovery days focusing on mobility and blood flow.',
        durationMinutes: 30,
        difficultyLevel: 'beginner',
        caloriesBurn: 200,
        rating: '4.5',
        imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b',
        categoryId: categoryMap.get('Full Body'),
      }
    ]

    // Insert workouts one by one
    for (const workout of workoutData) {
      // Skip if category ID is not found
      if (!workout.categoryId) {
        console.warn(`⚠️ Skipping workout "${workout.title}" - Category not found`)
        continue
      }

      const existingWorkout = await db.query.workouts.findFirst({
        where: eq(workouts.title, workout.title),
      })

      if (existingWorkout) {
        console.warn(`⚠️ Skipping workout "${workout.title}" - Already exists`)
        continue
      }

      // Insert new workout
      await db.insert(workouts).values(workout)
      console.log(`💪 Gym workout "${workout.title}" seeded`)
    }

    console.log('✅ Successfully seeded gym workouts')
  } catch (error) {
    if (error instanceof Error) {
      console.error('❌ Error seeding gym workouts:', error.message)
    } else {
      console.error('❌ Error seeding gym workouts:', String(error))
    }
    throw error
  }
} 