import { db } from '../client'
import { exercises, workoutClasses, workoutExercises, workouts, workoutToClass } from '../schema'
import { and, eq, inArray } from 'drizzle-orm'

export async function seedHomeWorkoutExercises() {
  console.log('🌱 Seeding home workout exercises...')

  try {
    // Get the Home workout class
    const homeClass = await db.query.workoutClasses.findFirst({
      where: eq(workoutClasses.name, 'Home')
    })

    if (!homeClass) {
      throw new Error('Home workout class not found')
    }

    // Define home exercise names
    const homeExerciseNames = [
      'Push-ups',
      'Squats',
      'Lunges',
      'Plank',
      'Burpees',
      'Mountain Climbers',
      'Jumping Jacks',
      'Crunches',
      'Russian Twists',
      'Leg Raises',
      'Side Planks',
      'Deep Breathing',
    ]

    // Get all home exercises
    const homeExercises = await db.query.exercises.findMany({
      where: inArray(exercises.name, homeExerciseNames)
    })

    // Create a map of exercise names to IDs for easier lookup
    const exerciseMap = new Map(homeExercises.map(ex => [ex.name, ex.id]))

    // Define home workout titles
    const homeWorkoutTitles = [
      'Full Body Blast',
      'Total Body Tone',
      'Booty Builder',
      'Leg Day Intensity',
      'Arms & Shoulders Sculptor',
      'Upper Body Power',
      'Ab Definition',
      'Core Power',
      'HIIT Burn',
      'Quick HIIT',
      'Post-Workout Cooldown',
    ]

    // Get all home workouts
    const homeWorkouts = await db.query.workouts.findMany({
      where: inArray(workouts.title, homeWorkoutTitles)
    })

    // Create a map of workout titles to IDs for easier lookup
    // const workoutMap = new Map(homeWorkouts.map(w => [w.title, w.id]))

    // Add workout class relations for all home workouts
    for (const workout of homeWorkouts) {
      // Check if relation already exists
      const existingRelation = await db.query.workoutToClass.findFirst({
        where: and(
          eq(workoutToClass.workoutId, workout.id),
          eq(workoutToClass.classId, homeClass.id)
        )
      })

      if (!existingRelation) {
        await db.insert(workoutToClass).values({
          workoutId: workout.id,
          classId: homeClass.id
        })
        console.log(`🏠 Added Home class relation to workout "${workout.title}"`)
      }
    }

    // Get all workouts and exercises
    const allWorkouts = await db.query.workouts.findMany()
    const allExercises = await db.query.exercises.findMany()

    // Mapping of workouts to exercises with sets, reps, and rest times
    const workoutExercisesData = [
      // Full Body Blast
      {
        workoutTitle: 'Full Body Blast',
        exercises: [
          { name: 'Push-ups', sets: 3, reps: 15, restSeconds: 60, orderIndex: 1 },
          { name: 'Squats', sets: 3, reps: 15, restSeconds: 60, orderIndex: 2 },
          { name: 'Dumbbell Rows', sets: 3, reps: 12, restSeconds: 60, orderIndex: 3 },
          { name: 'Lunges', sets: 3, reps: 12, restSeconds: 60, orderIndex: 4 },
          { name: 'Plank', sets: 3, reps: 30, restSeconds: 45, orderIndex: 5 }, // Reps is seconds for planks
          { name: 'Burpees', sets: 3, reps: 10, restSeconds: 45, orderIndex: 6 },
          { name: 'Mountain Climbers', sets: 3, reps: 20, restSeconds: 45, orderIndex: 7 }
        ]
      },
      // Total Body Tone
      {
        workoutTitle: 'Total Body Tone',
        exercises: [
          { name: 'Squats', sets: 3, reps: 12, restSeconds: 45, orderIndex: 1 },
          { name: 'Push-ups', sets: 3, reps: 10, restSeconds: 45, orderIndex: 2 },
          { name: 'Glute Bridges', sets: 3, reps: 15, restSeconds: 45, orderIndex: 3 },
          { name: 'Dumbbell Rows', sets: 3, reps: 10, restSeconds: 45, orderIndex: 4 },
          { name: 'Plank', sets: 3, reps: 20, restSeconds: 30, orderIndex: 5 }, // Reps is seconds for planks
          { name: 'Jumping Jacks', sets: 2, reps: 30, restSeconds: 30, orderIndex: 6 }
        ]
      },
      // Booty Builder
      {
        workoutTitle: 'Booty Builder',
        exercises: [
          { name: 'Squats', sets: 4, reps: 15, restSeconds: 60, orderIndex: 1 },
          { name: 'Lunges', sets: 3, reps: 12, restSeconds: 60, orderIndex: 2 },
          { name: 'Glute Bridges', sets: 4, reps: 20, restSeconds: 45, orderIndex: 3 },
          { name: 'Bulgarian Split Squats', sets: 3, reps: 10, restSeconds: 60, orderIndex: 4 },
          { name: 'Romanian Deadlifts', sets: 3, reps: 12, restSeconds: 60, orderIndex: 5 },
          { name: 'Calf Raises', sets: 3, reps: 15, restSeconds: 30, orderIndex: 6 }
        ]
      },
      // Leg Day Intensity
      {
        workoutTitle: 'Leg Day Intensity',
        exercises: [
          { name: 'Squats', sets: 5, reps: 10, restSeconds: 90, orderIndex: 1 },
          { name: 'Deadlifts', sets: 4, reps: 8, restSeconds: 90, orderIndex: 2 },
          { name: 'Lunges', sets: 4, reps: 10, restSeconds: 60, orderIndex: 3 },
          { name: 'Bulgarian Split Squats', sets: 3, reps: 12, restSeconds: 60, orderIndex: 4 },
          { name: 'Glute Bridges', sets: 3, reps: 15, restSeconds: 60, orderIndex: 5 },
          { name: 'Calf Raises', sets: 4, reps: 20, restSeconds: 45, orderIndex: 6 },
          { name: 'Jump Squats', sets: 3, reps: 15, restSeconds: 60, orderIndex: 7 }
        ]
      },
      // Arms & Shoulders Sculptor
      {
        workoutTitle: 'Arms & Shoulders Sculptor',
        exercises: [
          { name: 'Push-ups', sets: 3, reps: 12, restSeconds: 60, orderIndex: 1 },
          { name: 'Tricep Dips', sets: 3, reps: 12, restSeconds: 60, orderIndex: 2 },
          { name: 'Bicep Curls', sets: 3, reps: 12, restSeconds: 60, orderIndex: 3 },
          { name: 'Lateral Raises', sets: 3, reps: 15, restSeconds: 45, orderIndex: 4 },
          { name: 'Overhead Press', sets: 3, reps: 12, restSeconds: 60, orderIndex: 5 },
          { name: 'Dumbbell Rows', sets: 3, reps: 12, restSeconds: 60, orderIndex: 6 }
        ]
      },
      // Upper Body Power
      {
        workoutTitle: 'Upper Body Power',
        exercises: [
          { name: 'Bench Press', sets: 4, reps: 8, restSeconds: 90, orderIndex: 1 },
          { name: 'Pull-ups', sets: 4, reps: 8, restSeconds: 90, orderIndex: 2 },
          { name: 'Overhead Press', sets: 4, reps: 8, restSeconds: 90, orderIndex: 3 },
          { name: 'Dumbbell Rows', sets: 4, reps: 10, restSeconds: 60, orderIndex: 4 },
          { name: 'Tricep Dips', sets: 3, reps: 10, restSeconds: 60, orderIndex: 5 },
          { name: 'Push-ups', sets: 3, reps: 15, restSeconds: 60, orderIndex: 6 },
          { name: 'Bicep Curls', sets: 3, reps: 12, restSeconds: 60, orderIndex: 7 }
        ]
      },
      // Ab Definition
      {
        workoutTitle: 'Ab Definition',
        exercises: [
          { name: 'Plank', sets: 3, reps: 45, restSeconds: 30, orderIndex: 1 }, // Reps is seconds for planks
          { name: 'Crunches', sets: 3, reps: 20, restSeconds: 30, orderIndex: 2 },
          { name: 'Russian Twists', sets: 3, reps: 20, restSeconds: 30, orderIndex: 3 },
          { name: 'Leg Raises', sets: 3, reps: 15, restSeconds: 30, orderIndex: 4 },
          { name: 'Mountain Climbers', sets: 3, reps: 20, restSeconds: 30, orderIndex: 5 },
          { name: 'Side Planks', sets: 3, reps: 30, restSeconds: 30, orderIndex: 6 } // Reps is seconds for planks
        ]
      },
      // Core Power
      {
        workoutTitle: 'Core Power',
        exercises: [
          { name: 'Plank', sets: 4, reps: 60, restSeconds: 45, orderIndex: 1 }, // Reps is seconds for planks
          { name: 'Side Planks', sets: 3, reps: 45, restSeconds: 45, orderIndex: 2 }, // Reps is seconds for planks
          { name: 'Russian Twists', sets: 3, reps: 30, restSeconds: 45, orderIndex: 3 },
          { name: 'Leg Raises', sets: 4, reps: 15, restSeconds: 45, orderIndex: 4 },
          { name: 'Mountain Climbers', sets: 3, reps: 30, restSeconds: 45, orderIndex: 5 },
          { name: 'Crunches', sets: 3, reps: 25, restSeconds: 45, orderIndex: 6 }
        ]
      },
      // HIIT Burn
      {
        workoutTitle: 'HIIT Burn',
        exercises: [
          { name: 'Burpees', sets: 4, reps: 12, restSeconds: 30, orderIndex: 1 },
          { name: 'High Knees', sets: 4, reps: 30, restSeconds: 30, orderIndex: 2 },
          { name: 'Jumping Jacks', sets: 4, reps: 30, restSeconds: 30, orderIndex: 3 },
          { name: 'Mountain Climbers', sets: 4, reps: 30, restSeconds: 30, orderIndex: 4 },
          { name: 'Jump Rope', sets: 4, reps: 50, restSeconds: 30, orderIndex: 5 },
          { name: 'Box Jumps', sets: 4, reps: 15, restSeconds: 30, orderIndex: 6 },
          { name: 'Squats', sets: 4, reps: 20, restSeconds: 30, orderIndex: 7 }
        ]
      },
      // Quick HIIT
      {
        workoutTitle: 'Quick HIIT',
        exercises: [
          { name: 'Jumping Jacks', sets: 3, reps: 30, restSeconds: 20, orderIndex: 1 },
          { name: 'Burpees', sets: 3, reps: 10, restSeconds: 20, orderIndex: 2 },
          { name: 'Mountain Climbers', sets: 3, reps: 20, restSeconds: 20, orderIndex: 3 },
          { name: 'High Knees', sets: 3, reps: 20, restSeconds: 20, orderIndex: 4 },
          { name: 'Push-ups', sets: 3, reps: 10, restSeconds: 20, orderIndex: 5 }
        ]
      },
      // Post-Workout Cooldown
      {
        workoutTitle: 'Post-Workout Cooldown',
        exercises: [
          { name: 'Light Walking', sets: 1, reps: 1, restSeconds: 0, orderIndex: 1 },
          { name: 'Standing Forward Bend', sets: 2, reps: 1, restSeconds: 15, orderIndex: 2 },
          { name: "Child's Pose", sets: 2, reps: 1, restSeconds: 15, orderIndex: 3 },
          { name: 'Deep Breathing', sets: 3, reps: 5, restSeconds: 10, orderIndex: 4 }
        ]
      }
    ]

    // Process each workout
    for (const workoutExerciseSet of workoutExercisesData) {
      const workout = allWorkouts.find(w => w.title === workoutExerciseSet.workoutTitle)
      
      if (!workout) {
        console.warn(`⚠️ Workout "${workoutExerciseSet.workoutTitle}" not found, skipping exercises`)
        continue
      }

      // check if workout exercises already exist
      const existingWorkoutExercises = await db.query.workoutExercises.findMany({
        where: eq(workoutExercises.workoutId, workout.id)
      })
      
      if (existingWorkoutExercises.length >= 3) {
        console.warn(`⚠️ Workout exercises for "${workout.title}" already exist, skipping`)
        continue
      }
      
      console.log(`🔄 Adding exercises for workout "${workout.title}"`)
      
      // Add each exercise
      for (const exerciseData of workoutExerciseSet.exercises) {
        const exercise = allExercises.find(e => e.name === exerciseData.name)
        
        if (!exercise) {
          console.warn(`⚠️ Exercise "${exerciseData.name}" not found, skipping`)
          continue
        }
        
        await db.insert(workoutExercises).values({
          workoutId: workout.id,
          exerciseId: exercise.id,
          sets: exerciseData.sets,
          reps: exerciseData.reps,
          restSeconds: exerciseData.restSeconds,
          orderIndex: exerciseData.orderIndex
        })
      }
    }

    console.log('✅ Successfully seeded workout exercises')
  } catch (error) {
    if (error instanceof Error) {
      console.error('❌ Error seeding workout exercises:', error.message)
    } else {
      console.error('❌ Error seeding workout exercises:', String(error))
    }
    throw error
  }
} 