import { db } from '../client'
import { workouts, exercises, workoutExercises, workoutToClass, workoutClasses } from '../schema'
import { eq, and, inArray } from 'drizzle-orm'

export async function seedPilatesWorkoutExercises() {
  console.log('🧘‍♀️ Seeding Pilates workout exercises...')

  try {
    // Get the Pilates workout class
    const pilatesClass = await db.query.workoutClasses.findFirst({
      where: eq(workoutClasses.name, 'Pilates')
    })

    if (!pilatesClass) {
      throw new Error('Pilates workout class not found')
    }

    // Define Pilates exercise names
    const pilatesExerciseNames = [
      'The Hundred',
      'Roll Up',
      'Single Leg Circles',
      'Rolling Like a Ball',
      'Single Leg Stretch',
      'Double Leg Stretch',
      'Spine Stretch Forward',
      'Saw',
      'Swan Dive',
      'Teaser',
      'Side Kicks',
      'Corkscrew',
      'Open Leg Rocker',
      'Jack Knife',
      'Boomerang',
      'Plank to Pike',
      'Push-Up to Plank',
      'Shoulder Bridge',
      'Seal',
      'Double Leg Kicks',
    ]

    // Get all Pilates exercises
    const pilatesExercises = await db.query.exercises.findMany({
      where: inArray(exercises.name, pilatesExerciseNames)
    })

    // Create a map of exercise names to IDs for easier lookup
    const exerciseMap = new Map(pilatesExercises.map(ex => [ex.name, ex.id]))

    // Define Pilates workout titles
    const pilatesWorkoutTitles = [
      'Core Control Pilates',
      'Advanced Core Flow',
      'Core Stability & Balance',
      'Deep Core Power',
      'Total Body Pilates Sculpt',
      'Power Pilates Fusion',
      'Beginner Full Body Flow',
      'Dynamic Full Body Challenge',
      'Lower Body Pilates Tone',
      'Pilates Leg Sculptor',
      'Gentle Lower Body & Core',
      'Lower Body Power & Balance',
      'Upper Body Pilates Flow',
      'Advanced Arm & Core Pilates',
      'Posture Perfect Pilates',
      'Upper Body Strength & Control',
      'Pilates HIIT Blend',
      'Power Pilates Intervals',
      'Gentle Pilates Stretch',
      'Mind-Body Pilates Flow'
    ]

    // Get all Pilates workouts
    const pilatesWorkouts = await db.query.workouts.findMany({
      where: inArray(workouts.title, pilatesWorkoutTitles)
    })

    // Create a map of workout titles to IDs for easier lookup
    const workoutMap = new Map(pilatesWorkouts.map(w => [w.title, w.id]))

    // Add workout class relations for all Pilates workouts
    for (const workout of pilatesWorkouts) {
      // Check if relation already exists
      const existingRelation = await db.query.workoutToClass.findFirst({
        where: and(
          eq(workoutToClass.workoutId, workout.id),
          eq(workoutToClass.classId, pilatesClass.id)
        ),
      })

      if (!existingRelation) {
        await db.insert(workoutToClass).values({
          workoutId: workout.id,
          classId: pilatesClass.id
        })
        console.log(`🧘‍♀️ Added Pilates class relation to workout "${workout.title}"`)
      }
    }

    const workoutExercisesData = [
      // Core Control Pilates (Beginner) - Keep at 4 exercises
      {
        workoutId: workoutMap.get('Core Control Pilates'),
        exercises: [
          { name: 'The Hundred', sets: 1, reps: 100, restSeconds: 60, orderIndex: 1 },
          { name: 'Roll Up', sets: 2, reps: 8, restSeconds: 45, orderIndex: 2 },
          { name: 'Single Leg Circles', sets: 2, reps: 10, restSeconds: 30, orderIndex: 3 },
          { name: 'Rolling Like a Ball', sets: 2, reps: 8, restSeconds: 45, orderIndex: 4 }
        ]
      },

      // Advanced Core Flow - Add more exercises for advanced
      {
        workoutId: workoutMap.get('Advanced Core Flow'),
        exercises: [
          { name: 'The Hundred', sets: 2, reps: 100, restSeconds: 45, orderIndex: 1 },
          { name: 'Teaser', sets: 3, reps: 10, restSeconds: 45, orderIndex: 2 },
          { name: 'Corkscrew', sets: 3, reps: 8, restSeconds: 30, orderIndex: 3 },
          { name: 'Jack Knife', sets: 3, reps: 8, restSeconds: 45, orderIndex: 4 },
          { name: 'Boomerang', sets: 2, reps: 8, restSeconds: 60, orderIndex: 5 },
          { name: 'Open Leg Rocker', sets: 3, reps: 8, restSeconds: 45, orderIndex: 6 }
        ]
      },

      // Core Stability & Balance (Intermediate) - Add one more exercise
      {
        workoutId: workoutMap.get('Core Stability & Balance'),
        exercises: [
          { name: 'Single Leg Stretch', sets: 2, reps: 12, restSeconds: 45, orderIndex: 1 },
          { name: 'Double Leg Stretch', sets: 2, reps: 10, restSeconds: 45, orderIndex: 2 },
          { name: 'Open Leg Rocker', sets: 2, reps: 8, restSeconds: 60, orderIndex: 3 },
          { name: 'Roll Up', sets: 2, reps: 8, restSeconds: 45, orderIndex: 4 },
          { name: 'Teaser', sets: 2, reps: 8, restSeconds: 45, orderIndex: 5 }
        ]
      },

      // Deep Core Power (Advanced) - Add more exercises
      {
        workoutId: workoutMap.get('Deep Core Power'),
        exercises: [
          { name: 'The Hundred', sets: 2, reps: 100, restSeconds: 45, orderIndex: 1 },
          { name: 'Teaser', sets: 3, reps: 12, restSeconds: 45, orderIndex: 2 },
          { name: 'Jack Knife', sets: 3, reps: 10, restSeconds: 45, orderIndex: 3 },
          { name: 'Corkscrew', sets: 3, reps: 10, restSeconds: 45, orderIndex: 4 },
          { name: 'Boomerang', sets: 3, reps: 8, restSeconds: 60, orderIndex: 5 },
          { name: 'Open Leg Rocker', sets: 3, reps: 8, restSeconds: 45, orderIndex: 6 }
        ]
      },

      // Total Body Pilates Sculpt (Intermediate) - Add more exercises
      {
        workoutId: workoutMap.get('Total Body Pilates Sculpt'),
        exercises: [
          { name: 'The Hundred', sets: 2, reps: 100, restSeconds: 45, orderIndex: 1 },
          { name: 'Roll Up', sets: 2, reps: 10, restSeconds: 45, orderIndex: 2 },
          { name: 'Swan Dive', sets: 2, reps: 8, restSeconds: 45, orderIndex: 3 },
          { name: 'Side Kicks', sets: 2, reps: 12, restSeconds: 30, orderIndex: 4 },
          { name: 'Teaser', sets: 2, reps: 8, restSeconds: 60, orderIndex: 5 }
        ]
      },

      // Beginner Full Body Flow - Keep at 4 exercises
      {
        workoutId: workoutMap.get('Beginner Full Body Flow'),
        exercises: [
          { name: 'The Hundred', sets: 1, reps: 100, restSeconds: 60, orderIndex: 1 },
          { name: 'Rolling Like a Ball', sets: 2, reps: 8, restSeconds: 45, orderIndex: 2 },
          { name: 'Single Leg Circles', sets: 2, reps: 8, restSeconds: 45, orderIndex: 3 },
          { name: 'Spine Stretch Forward', sets: 2, reps: 8, restSeconds: 45, orderIndex: 4 }
        ]
      },

      // Dynamic Full Body Challenge (Advanced) - Add more exercises
      {
        workoutId: workoutMap.get('Dynamic Full Body Challenge'),
        exercises: [
          { name: 'The Hundred', sets: 2, reps: 100, restSeconds: 45, orderIndex: 1 },
          { name: 'Jack Knife', sets: 3, reps: 10, restSeconds: 45, orderIndex: 2 },
          { name: 'Boomerang', sets: 3, reps: 8, restSeconds: 45, orderIndex: 3 },
          { name: 'Teaser', sets: 3, reps: 12, restSeconds: 45, orderIndex: 4 },
          { name: 'Swan Dive', sets: 3, reps: 10, restSeconds: 45, orderIndex: 5 },
          { name: 'Corkscrew', sets: 3, reps: 8, restSeconds: 45, orderIndex: 6 },
          { name: 'Open Leg Rocker', sets: 3, reps: 8, restSeconds: 60, orderIndex: 7 }
        ]
      },

      // Lower Body Pilates Tone (Intermediate) - Add more exercises
      {
        workoutId: workoutMap.get('Lower Body Pilates Tone'),
        exercises: [
          { name: 'Single Leg Circles', sets: 3, reps: 12, restSeconds: 30, orderIndex: 1 },
          { name: 'Side Kicks', sets: 3, reps: 15, restSeconds: 45, orderIndex: 2 },
          { name: 'Single Leg Stretch', sets: 2, reps: 12, restSeconds: 45, orderIndex: 3 },
          { name: 'Double Leg Stretch', sets: 2, reps: 10, restSeconds: 45, orderIndex: 4 },
          { name: 'Open Leg Rocker', sets: 2, reps: 8, restSeconds: 45, orderIndex: 5 }
        ]
      },

      // Gentle Lower Body & Core (Beginner) - Keep at 4 exercises
      {
        workoutId: workoutMap.get('Gentle Lower Body & Core'),
        exercises: [
          { name: 'Single Leg Circles', sets: 2, reps: 8, restSeconds: 45, orderIndex: 1 },
          { name: 'Side Kicks', sets: 2, reps: 10, restSeconds: 45, orderIndex: 2 },
          { name: 'Spine Stretch Forward', sets: 2, reps: 8, restSeconds: 45, orderIndex: 3 },
          { name: 'Rolling Like a Ball', sets: 2, reps: 6, restSeconds: 45, orderIndex: 4 }
        ]
      },

      // Upper Body Pilates Flow (Intermediate) - Add more exercises
      {
        workoutId: workoutMap.get('Upper Body Pilates Flow'),
        exercises: [
          { name: 'The Hundred', sets: 2, reps: 100, restSeconds: 45, orderIndex: 1 },
          { name: 'Swan Dive', sets: 3, reps: 8, restSeconds: 45, orderIndex: 2 },
          { name: 'Saw', sets: 2, reps: 8, restSeconds: 45, orderIndex: 3 },
          { name: 'Roll Up', sets: 2, reps: 10, restSeconds: 45, orderIndex: 4 },
          { name: 'Spine Stretch Forward', sets: 2, reps: 8, restSeconds: 45, orderIndex: 5 }
        ]
      },

      // Posture Perfect Pilates (Beginner) - Keep at 4 exercises
      {
        workoutId: workoutMap.get('Posture Perfect Pilates'),
        exercises: [
          { name: 'Spine Stretch Forward', sets: 2, reps: 8, restSeconds: 45, orderIndex: 1 },
          { name: 'Swan Dive', sets: 2, reps: 6, restSeconds: 45, orderIndex: 2 },
          { name: 'Roll Up', sets: 2, reps: 8, restSeconds: 45, orderIndex: 3 },
          { name: 'Saw', sets: 2, reps: 6, restSeconds: 45, orderIndex: 4 }
        ]
      },

      // Upper Body Strength & Control (Advanced)
      {
        workoutId: workoutMap.get('Upper Body Strength & Control'),
        exercises: [
          { name: 'The Hundred', sets: 2, reps: 100, restSeconds: 45, orderIndex: 1 },
          { name: 'Push-Up to Plank', sets: 3, reps: 10, restSeconds: 45, orderIndex: 2 },
          { name: 'Swan Dive', sets: 3, reps: 10, restSeconds: 45, orderIndex: 3 },
          { name: 'Plank to Pike', sets: 3, reps: 8, restSeconds: 45, orderIndex: 4 },
          { name: 'Double Leg Kicks', sets: 3, reps: 12, restSeconds: 45, orderIndex: 5 },
          { name: 'Teaser', sets: 2, reps: 8, restSeconds: 60, orderIndex: 6 }
        ]
      },

      // Pilates HIIT Blend (Advanced)
      {
        workoutId: workoutMap.get('Pilates HIIT Blend'),
        exercises: [
          { name: 'The Hundred', sets: 2, reps: 100, restSeconds: 30, orderIndex: 1 },
          { name: 'Push-Up to Plank', sets: 3, reps: 12, restSeconds: 30, orderIndex: 2 },
          { name: 'Jack Knife', sets: 3, reps: 10, restSeconds: 30, orderIndex: 3 },
          { name: 'Plank to Pike', sets: 3, reps: 10, restSeconds: 30, orderIndex: 4 },
          { name: 'Teaser', sets: 3, reps: 10, restSeconds: 30, orderIndex: 5 },
          { name: 'Double Leg Kicks', sets: 3, reps: 15, restSeconds: 30, orderIndex: 6 },
          { name: 'Boomerang', sets: 2, reps: 8, restSeconds: 45, orderIndex: 7 }
        ]
      },

      // Power Pilates Intervals (Advanced)
      {
        workoutId: workoutMap.get('Power Pilates Intervals'),
        exercises: [
          { name: 'The Hundred', sets: 3, reps: 100, restSeconds: 30, orderIndex: 1 },
          { name: 'Roll Up', sets: 3, reps: 12, restSeconds: 30, orderIndex: 2 },
          { name: 'Single Leg Stretch', sets: 3, reps: 15, restSeconds: 30, orderIndex: 3 },
          { name: 'Double Leg Stretch', sets: 3, reps: 12, restSeconds: 30, orderIndex: 4 },
          { name: 'Shoulder Bridge', sets: 3, reps: 12, restSeconds: 30, orderIndex: 5 },
          { name: 'Jack Knife', sets: 2, reps: 10, restSeconds: 45, orderIndex: 6 }
        ]
      },

      // Gentle Pilates Stretch (Beginner)
      {
        workoutId: workoutMap.get('Gentle Pilates Stretch'),
        exercises: [
          { name: 'The Hundred', sets: 1, reps: 100, restSeconds: 60, orderIndex: 1 },
          { name: 'Spine Stretch Forward', sets: 2, reps: 8, restSeconds: 45, orderIndex: 2 },
          { name: 'Single Leg Circles', sets: 2, reps: 8, restSeconds: 45, orderIndex: 3 },
          { name: 'Shoulder Bridge', sets: 2, reps: 8, restSeconds: 45, orderIndex: 4 }
        ]
      },

      // Mind-Body Pilates Flow (Intermediate)
      {
        workoutId: workoutMap.get('Mind-Body Pilates Flow'),
        exercises: [
          { name: 'The Hundred', sets: 1, reps: 100, restSeconds: 45, orderIndex: 1 },
          { name: 'Rolling Like a Ball', sets: 2, reps: 8, restSeconds: 45, orderIndex: 2 },
          { name: 'Seal', sets: 2, reps: 6, restSeconds: 45, orderIndex: 3 },
          { name: 'Spine Stretch Forward', sets: 2, reps: 8, restSeconds: 45, orderIndex: 4 },
          { name: 'Swan Dive', sets: 2, reps: 6, restSeconds: 45, orderIndex: 5 }
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

        console.log(`🧘‍♀️ Added exercise "${exercise.name}" to workout`)
      }
    }

    console.log('✅ Successfully seeded Pilates workout exercises')
  } catch (error) {
    if (error instanceof Error) {
      console.error('❌ Error seeding Pilates workout exercises:', error.message)
    } else {
      console.error('❌ Error seeding Pilates workout exercises:', String(error))
    }
    throw error
  }
} 