import { db } from '../client'
import { workouts, workoutCategories } from '../schema'
import { eq } from 'drizzle-orm'

export async function seedWorkouts() {
  console.log('🌱 Seeding workouts...')

  try {
    // First, get all category IDs
    const categories = await db.select().from(workoutCategories)
    const categoryMap = new Map(categories.map(cat => [cat.name, cat.id]))

    const workoutData = [
      // Full Body Workouts
      {
        title: 'Full Body Blast',
        description: 'A comprehensive full-body workout combining strength training and cardio for maximum results. Perfect for total body conditioning and calorie burn.',
        durationMinutes: 45,
        difficultyLevel: 'intermediate',
        caloriesBurn: 450,
        rating: '4.8',
        imageUrl: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438',
        categoryId: categoryMap.get('Full Body'),
      },
      {
        title: 'Total Body Tone',
        description: 'Build strength and endurance with this balanced full-body workout. Includes both bodyweight exercises and dumbbell movements.',
        durationMinutes: 30,
        difficultyLevel: 'beginner',
        caloriesBurn: 300,
        rating: '4.5',
        imageUrl: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155',
        categoryId: categoryMap.get('Full Body'),
      },

      // Lower Body Workouts
      {
        title: 'Booty Builder',
        description: 'Focus on building and shaping your glutes with this targeted lower body workout. Includes squats, lunges, and hip thrusts.',
        durationMinutes: 40,
        difficultyLevel: 'intermediate',
        caloriesBurn: 380,
        rating: '4.9',
        imageUrl: 'https://images.unsplash.com/photo-1534258936925-c58bed479fcb',
        categoryId: categoryMap.get('Lower Body'),
      },
      {
        title: 'Leg Day Intensity',
        description: 'Challenge your lower body with this high-intensity leg workout. Perfect for building strength and definition in your legs.',
        durationMinutes: 35,
        difficultyLevel: 'advanced',
        caloriesBurn: 400,
        rating: '4.7',
        imageUrl: 'https://images.unsplash.com/photo-1574680178050-55c6a6a96e0a',
        categoryId: categoryMap.get('Lower Body'),
      },

      // Upper Body Workouts
      {
        title: 'Arms & Shoulders Sculptor',
        description: 'Define and tone your upper body with this targeted workout focusing on arms, shoulders, and upper back.',
        durationMinutes: 35,
        difficultyLevel: 'intermediate',
        caloriesBurn: 320,
        rating: '4.6',
        imageUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e',
        categoryId: categoryMap.get('Upper Body'),
      },
      {
        title: 'Upper Body Power',
        description: 'Build upper body strength and muscle with this challenging workout. Includes push-ups, pull-ups, and dumbbell exercises.',
        durationMinutes: 40,
        difficultyLevel: 'advanced',
        caloriesBurn: 350,
        rating: '4.8',
        imageUrl: 'https://images.unsplash.com/photo-1590507621108-433608c97823',
        categoryId: categoryMap.get('Upper Body'),
      },

      // Core Workouts
      {
        title: 'Ab Definition',
        description: 'Target your core with this focused ab workout. Includes exercises for upper abs, lower abs, and obliques.',
        durationMinutes: 20,
        difficultyLevel: 'intermediate',
        caloriesBurn: 200,
        rating: '4.7',
        imageUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b',
        categoryId: categoryMap.get('Core'),
      },
      {
        title: 'Core Power',
        description: 'Strengthen your entire core with this comprehensive workout. Focuses on building stability and power.',
        durationMinutes: 25,
        difficultyLevel: 'advanced',
        caloriesBurn: 250,
        rating: '4.6',
        imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b',
        categoryId: categoryMap.get('Core'),
      },

      // HIIT Workouts
      {
        title: 'HIIT Burn',
        description: 'Torch calories with this high-intensity interval training workout. Alternates between intense bursts and active recovery.',
        durationMinutes: 30,
        difficultyLevel: 'advanced',
        caloriesBurn: 400,
        rating: '4.9',
        imageUrl: 'https://images.unsplash.com/photo-1599058945522-28d584b6f0ff',
        categoryId: categoryMap.get('HIIT'),
      },
      {
        title: 'Quick HIIT',
        description: 'A fast-paced HIIT workout that maximizes calorie burn in minimal time. Perfect for busy schedules.',
        durationMinutes: 20,
        difficultyLevel: 'intermediate',
        caloriesBurn: 300,
        rating: '4.7',
        imageUrl: 'https://images.unsplash.com/photo-1601422407692-ec4eeec1d9b3',
        categoryId: categoryMap.get('HIIT'),
      },
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
    }

    console.log('✅ Successfully seeded workouts')
  } catch (error) {
    if (error instanceof Error) {
      console.error('❌ Error seeding workouts:', error.message)
    } else {
      console.error('❌ Error seeding workouts:', String(error))
    }
    throw error
  }
} 