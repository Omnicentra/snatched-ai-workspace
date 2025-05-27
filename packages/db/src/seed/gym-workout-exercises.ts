import { db } from '../client'
import { workouts, exercises, workoutExercises, workoutToClass, workoutClasses } from '../schema'
import { eq, and, inArray } from 'drizzle-orm'

export async function seedGymWorkoutExercises() {
  console.log('💪 Seeding gym workout exercises...')

  try {
    // Get the Gym workout class
    const gymClass = await db.query.workoutClasses.findFirst({
      where: eq(workoutClasses.name, 'Gym')
    })

    if (!gymClass) {
      throw new Error('Gym workout class not found')
    }

    // Define gym exercise names
    const gymExerciseNames = [
      'Barbell Back Squat',
      'Deadlifts',
      'Barbell Bench Press',
      'Overhead Press',
      'Barbell Row',
      'Dumbbell Shoulder Press',
      'Incline Dumbbell Press',
      'Dips',
      'Pull-ups',
      'Lat Pulldown',
      'Face Pulls',
      'Romanian Deadlift',
      'Bulgarian Split Squat',
      'Hip Thrust',
      'Cable Woodchop',
      'Hanging Leg Raise',
      'Ab Wheel Rollout',
      'Dumbbell Lateral Raise',
      'Tricep Pushdown',
      'Dumbbell Curl',
      'Box Jumps',
      'Medicine Ball Slam',
      'Battle Ropes',
      'Burpees',
      'Mountain Climbers'
    ]

    // Get all gym exercises
    const gymExercises = await db.query.exercises.findMany({
      where: inArray(exercises.name, gymExerciseNames)
    })

    // Create a map of exercise names to IDs for easier lookup
    const exerciseMap = new Map(gymExercises.map(ex => [ex.name, ex.id]))

    // Define gym workout titles
    const gymWorkoutTitles = [
      'Full Body Power',
      'Full Body Circuit',
      'Beginner Full Body',
      'Upper Body Push Power',
      'Back & Biceps Blast',
      'Leg Day Power',
      'Glute Builder',
      'Core Strength & Power',
      'Foundation Core',
      'Power HIIT',
      'Beginner HIIT',
      'Powerlifting Basics',
      'Athletic Power',
      'Shoulder Sculptor',
      'Functional Strength',
      'Active Recovery',
      'Lower Body Strength',
      'Booty Builder',
      'Leg Day',
      'Leg Day Intensity',
      'Leg Day Power',
      'Lower Body Burn',
      'Lower Body Power',
      'Lower Body Strength',
      'Arms & Shoulders Sculptor',
      'Upper Body Power',
      'Upper Body Powerhouse',
      'Upper Body Strength',
      'Ab Definition',
      'Core Activation',
      'Core and Recovery',
      'Core Conditioning',
      'Core Crusher',
      'Core Power',
      'Core Strengthening',
      'Shoulders & Core',
      'Cardio and Core',
    ]

    // Get all gym workouts
    const gymWorkouts = await db.query.workouts.findMany({
      where: inArray(workouts.title, gymWorkoutTitles)
    })

    // Create a map of workout titles to IDs for easier lookup
    const workoutMap = new Map(gymWorkouts.map(w => [w.title, w.id]))

    // Add workout class relations for all gym workouts
    for (const workout of gymWorkouts) {
      // Check if relation already exists
      const existingRelation = await db.query.workoutToClass.findFirst({
        where: and(
          eq(workoutToClass.workoutId, workout.id),
          eq(workoutToClass.classId, gymClass.id)
        ),
      })

      if (!existingRelation) {
        await db.insert(workoutToClass).values({
          workoutId: workout.id,
          classId: gymClass.id
        })
        console.log(`💪 Added Gym class relation to workout "${workout.title}"`)
      }
    }

    const workoutExercisesData = [
      // Full Body Power (Advanced)
      {
        workoutId: workoutMap.get('Full Body Power'),
        exercises: [
          { name: 'Barbell Back Squat', sets: 5, reps: 5, restSeconds: 180, orderIndex: 1 },
          { name: 'Deadlifts', sets: 5, reps: 5, restSeconds: 180, orderIndex: 2 },
          { name: 'Barbell Bench Press', sets: 5, reps: 5, restSeconds: 180, orderIndex: 3 },
          { name: 'Barbell Row', sets: 4, reps: 8, restSeconds: 120, orderIndex: 4 },
          { name: 'Overhead Press', sets: 4, reps: 8, restSeconds: 120, orderIndex: 5 },
          { name: 'Pull-ups', sets: 3, reps: 10, restSeconds: 90, orderIndex: 6 }
        ]
      },

      // Beginner Full Body
      {
        workoutId: workoutMap.get('Beginner Full Body'),
        exercises: [
          { name: 'Barbell Back Squat', sets: 3, reps: 10, restSeconds: 90, orderIndex: 1 },
          { name: 'Dumbbell Shoulder Press', sets: 3, reps: 12, restSeconds: 60, orderIndex: 2 },
          { name: 'Lat Pulldown', sets: 3, reps: 12, restSeconds: 60, orderIndex: 3 },
          { name: 'Romanian Deadlift', sets: 3, reps: 10, restSeconds: 90, orderIndex: 4 }
        ]
      },

      // Upper Body Push Power (Advanced)
      {
        workoutId: workoutMap.get('Upper Body Push Power'),
        exercises: [
          { name: 'Barbell Bench Press', sets: 5, reps: 5, restSeconds: 180, orderIndex: 1 },
          { name: 'Overhead Press', sets: 4, reps: 8, restSeconds: 120, orderIndex: 2 },
          { name: 'Incline Dumbbell Press', sets: 4, reps: 10, restSeconds: 90, orderIndex: 3 },
          { name: 'Dips', sets: 3, reps: 12, restSeconds: 90, orderIndex: 4 },
          { name: 'Dumbbell Lateral Raise', sets: 3, reps: 15, restSeconds: 60, orderIndex: 5 },
          { name: 'Tricep Pushdown', sets: 3, reps: 15, restSeconds: 60, orderIndex: 6 }
        ]
      },

      // Back & Biceps Blast (Intermediate)
      {
        workoutId: workoutMap.get('Back & Biceps Blast'),
        exercises: [
          { name: 'Pull-ups', sets: 4, reps: 8, restSeconds: 120, orderIndex: 1 },
          { name: 'Barbell Row', sets: 4, reps: 10, restSeconds: 90, orderIndex: 2 },
          { name: 'Lat Pulldown', sets: 3, reps: 12, restSeconds: 90, orderIndex: 3 },
          { name: 'Face Pulls', sets: 3, reps: 15, restSeconds: 60, orderIndex: 4 },
          { name: 'Dumbbell Curl', sets: 3, reps: 12, restSeconds: 60, orderIndex: 5 }
        ]
      },

      // Leg Day Intensity (Advanced)
      {
        workoutId: workoutMap.get('Leg Day Power'),
        exercises: [
          { name: 'Barbell Back Squat', sets: 5, reps: 5, restSeconds: 180, orderIndex: 1 },
          { name: 'Romanian Deadlift', sets: 4, reps: 8, restSeconds: 120, orderIndex: 2 },
          { name: 'Bulgarian Split Squat', sets: 3, reps: 12, restSeconds: 90, orderIndex: 3 },
          { name: 'Hip Thrust', sets: 4, reps: 12, restSeconds: 90, orderIndex: 4 },
          { name: 'Box Jumps', sets: 3, reps: 8, restSeconds: 120, orderIndex: 5 }
        ]
      },

      // Core Strength & Power (Advanced)
      {
        workoutId: workoutMap.get('Core Strength & Power'),
        exercises: [
          { name: 'Hanging Leg Raise', sets: 4, reps: 12, restSeconds: 90, orderIndex: 1 },
          { name: 'Ab Wheel Rollout', sets: 4, reps: 10, restSeconds: 90, orderIndex: 2 },
          { name: 'Cable Woodchop', sets: 3, reps: 15, restSeconds: 60, orderIndex: 3 },
          { name: 'Medicine Ball Slam', sets: 3, reps: 15, restSeconds: 60, orderIndex: 4 }
        ]
      },

      // Power HIIT (Advanced)
      {
        workoutId: workoutMap.get('Power HIIT'),
        exercises: [
          { name: 'Box Jumps', sets: 4, reps: 10, restSeconds: 30, orderIndex: 1 },
          { name: 'Medicine Ball Slam', sets: 4, reps: 15, restSeconds: 30, orderIndex: 2 },
          { name: 'Battle Ropes', sets: 4, reps: 30, restSeconds: 30, orderIndex: 3 },
          { name: 'Burpees', sets: 4, reps: 15, restSeconds: 30, orderIndex: 4 },
          { name: 'Mountain Climbers', sets: 4, reps: 30, restSeconds: 30, orderIndex: 5 }
        ]
      },

      // Powerlifting Basics (Intermediate)
      {
        workoutId: workoutMap.get('Powerlifting Basics'),
        exercises: [
          { name: 'Barbell Back Squat', sets: 5, reps: 5, restSeconds: 180, orderIndex: 1 },
          { name: 'Barbell Bench Press', sets: 5, reps: 5, restSeconds: 180, orderIndex: 2 },
          { name: 'Deadlifts', sets: 5, reps: 5, restSeconds: 180, orderIndex: 3 }
        ]
      },

      // Shoulder Sculptor (Intermediate)
      {
        workoutId: workoutMap.get('Shoulder Sculptor'),
        exercises: [
          { name: 'Overhead Press', sets: 4, reps: 8, restSeconds: 120, orderIndex: 1 },
          { name: 'Dumbbell Shoulder Press', sets: 4, reps: 10, restSeconds: 90, orderIndex: 2 },
          { name: 'Dumbbell Lateral Raise', sets: 3, reps: 15, restSeconds: 60, orderIndex: 3 },
          { name: 'Face Pulls', sets: 3, reps: 15, restSeconds: 60, orderIndex: 4 }
        ]
      },

      // Functional Strength (Intermediate)
      {
        workoutId: workoutMap.get('Functional Strength'),
        exercises: [
          { name: 'Deadlifts', sets: 4, reps: 8, restSeconds: 120, orderIndex: 1 },
          { name: 'Pull-ups', sets: 3, reps: 8, restSeconds: 90, orderIndex: 2 },
          { name: 'Bulgarian Split Squat', sets: 3, reps: 12, restSeconds: 90, orderIndex: 3 },
          { name: 'Medicine Ball Slam', sets: 3, reps: 15, restSeconds: 60, orderIndex: 4 },
          { name: 'Battle Ropes', sets: 3, reps: 30, restSeconds: 60, orderIndex: 5 }
        ]
      },

      // Active Recovery (Beginner)
      {
        workoutId: workoutMap.get('Active Recovery'),
        exercises: [
          { name: 'Face Pulls', sets: 2, reps: 15, restSeconds: 45, orderIndex: 1 },
          { name: 'Cable Woodchop', sets: 2, reps: 12, restSeconds: 45, orderIndex: 2 },
          { name: 'Romanian Deadlift', sets: 2, reps: 12, restSeconds: 45, orderIndex: 3 },
          { name: 'Dumbbell Lateral Raise', sets: 2, reps: 12, restSeconds: 45, orderIndex: 4 }
        ]
      }
    ]

    // Insert workout exercises
    for (const workoutData of workoutExercisesData) {
      const workoutId = workoutData.workoutId
      if (!workoutId) {
        console.warn('⚠️ Workout ID not found, skipping exercises')
        continue
      }

      for (const exercise of workoutData.exercises) {
        const exerciseId = exerciseMap.get(exercise.name)
        if (!exerciseId) {
          console.warn(`⚠️ Exercise "${exercise.name}" not found, skipping`)
          continue
        }

        // Check if relationship already exists
        const existing = await db.query.workoutExercises.findFirst({
          where: and(
            eq(workoutExercises.workoutId, workoutId),
            eq(workoutExercises.exerciseId, exerciseId),
            eq(workoutExercises.orderIndex, exercise.orderIndex)
          ),
        })

        if (existing) {
          console.log(`⚠️ Workout exercise relationship already exists, skipping`)
          continue
        }

        // Insert new relationship
        await db.insert(workoutExercises).values({
          workoutId,
          exerciseId,
          sets: exercise.sets,
          reps: exercise.reps,
          restSeconds: exercise.restSeconds,
          orderIndex: exercise.orderIndex
        })

        console.log(`💪 Added exercise "${exercise.name}" to workout`)
      }
    }

    console.log('✅ Successfully seeded gym workout exercises')
  } catch (error) {
    if (error instanceof Error) {
      console.error('❌ Error seeding gym workout exercises:', error.message)
    } else {
      console.error('❌ Error seeding gym workout exercises:', String(error))
    }
    throw error
  }
} 