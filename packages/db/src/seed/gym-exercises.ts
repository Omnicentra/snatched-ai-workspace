import { db } from '../client'
import { exercises } from '../schema'
import { eq } from 'drizzle-orm'

export async function seedGymExercises() {
  console.log('💪 Seeding gym exercises...')

  try {
    const gymExercisesData = [
      // Compound Exercises
      {
        name: 'Barbell Back Squat',
        description: 'A fundamental compound exercise that targets the entire lower body and core.',
        targetMuscles: 'Quads, Glutes, Hamstrings, Core',
        imageUrl: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155',
        videoUrl: 'https://example.com/videos/barbell-back-squat',
      },
      {
        name: 'Deadlifts',
        description: 'A powerful compound movement that builds overall strength and muscle mass.',
        targetMuscles: 'Back, Glutes, Hamstrings, Core',
        imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48',
        videoUrl: 'https://example.com/videos/deadlift',
      },
      {
        name: 'Barbell Bench Press',
        description: 'Classic compound exercise for upper body pushing strength.',
        targetMuscles: 'Chest, Shoulders, Triceps',
        imageUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd',
        videoUrl: 'https://example.com/videos/bench-press',
      },
      {
        name: 'Overhead Press',
        description: 'Compound movement for shoulder strength and stability.',
        targetMuscles: 'Shoulders, Triceps, Upper Back',
        imageUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e',
        videoUrl: 'https://example.com/videos/overhead-press',
      },
      {
        name: 'Barbell Row',
        description: 'Compound pulling exercise for back development.',
        targetMuscles: 'Back, Biceps, Core',
        imageUrl: 'https://images.unsplash.com/photo-1598266663439-2056e7d8f93d',
        videoUrl: 'https://example.com/videos/barbell-row',
      },

      // Upper Body Push
      {
        name: 'Dumbbell Shoulder Press',
        description: 'Dumbbell variation of overhead pressing for balanced shoulder development.',
        targetMuscles: 'Shoulders, Triceps',
        imageUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e',
        videoUrl: 'https://example.com/videos/dumbbell-shoulder-press',
      },
      {
        name: 'Incline Dumbbell Press',
        description: 'Upper chest focused pressing movement.',
        targetMuscles: 'Upper Chest, Shoulders, Triceps',
        imageUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd',
        videoUrl: 'https://example.com/videos/incline-dumbbell-press',
      },
      {
        name: 'Dips',
        description: 'Bodyweight exercise for chest and triceps development.',
        targetMuscles: 'Chest, Triceps, Shoulders',
        imageUrl: 'https://images.unsplash.com/photo-1598971639058-a106bc5be7c4',
        videoUrl: 'https://example.com/videos/dips',
      },

      // Upper Body Pull
      {
        name: 'Pull-ups',
        description: 'Fundamental upper body pulling exercise.',
        targetMuscles: 'Back, Biceps, Core',
        imageUrl: 'https://images.unsplash.com/photo-1598266663439-2056e7d8f93d',
        videoUrl: 'https://example.com/videos/pull-ups',
      },
      {
        name: 'Lat Pulldown',
        description: 'Machine-based back exercise targeting the latissimus dorsi.',
        targetMuscles: 'Back, Biceps',
        imageUrl: 'https://images.unsplash.com/photo-1598266663439-2056e7d8f93d',
        videoUrl: 'https://example.com/videos/lat-pulldown',
      },
      {
        name: 'Face Pulls',
        description: 'Rear deltoid and upper back exercise for posture.',
        targetMuscles: 'Rear Deltoids, Upper Back',
        imageUrl: 'https://images.unsplash.com/photo-1598266663439-2056e7d8f93d',
        videoUrl: 'https://example.com/videos/face-pulls',
      },

      // Lower Body
      {
        name: 'Romanian Deadlift',
        description: 'Hip-hinge movement focusing on hamstrings and glutes.',
        targetMuscles: 'Hamstrings, Glutes, Lower Back',
        imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48',
        videoUrl: 'https://example.com/videos/romanian-deadlift',
      },
      {
        name: 'Bulgarian Split Squat',
        description: 'Unilateral lower body exercise for balance and strength.',
        targetMuscles: 'Quads, Glutes, Hamstrings',
        imageUrl: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155',
        videoUrl: 'https://example.com/videos/bulgarian-split-squat',
      },
      {
        name: 'Hip Thrust',
        description: 'Focused glute exercise for strength and development.',
        targetMuscles: 'Glutes, Hamstrings',
        imageUrl: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155',
        videoUrl: 'https://example.com/videos/hip-thrust',
      },

      // Core/Abs
      {
        name: 'Cable Woodchop',
        description: 'Rotational core exercise for functional strength.',
        targetMuscles: 'Core, Obliques',
        imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b',
        videoUrl: 'https://example.com/videos/cable-woodchop',
      },
      {
        name: 'Hanging Leg Raise',
        description: 'Advanced core exercise for lower abs development.',
        targetMuscles: 'Core, Hip Flexors',
        imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b',
        videoUrl: 'https://example.com/videos/hanging-leg-raise',
      },
      {
        name: 'Ab Wheel Rollout',
        description: 'Dynamic core exercise for total ab development.',
        targetMuscles: 'Core, Shoulders',
        imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b',
        videoUrl: 'https://example.com/videos/ab-wheel-rollout',
      },

      // Isolation Exercises
      {
        name: 'Dumbbell Lateral Raise',
        description: 'Isolation exercise for lateral deltoid development.',
        targetMuscles: 'Lateral Deltoids',
        imageUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e',
        videoUrl: 'https://example.com/videos/lateral-raise',
      },
      {
        name: 'Tricep Pushdown',
        description: 'Isolation exercise for triceps development.',
        targetMuscles: 'Triceps',
        imageUrl: 'https://images.unsplash.com/photo-1598971639058-a106bc5be7c4',
        videoUrl: 'https://example.com/videos/tricep-pushdown',
      },
      {
        name: 'Dumbbell Curl',
        description: 'Classic biceps isolation exercise.',
        targetMuscles: 'Biceps',
        imageUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e',
        videoUrl: 'https://example.com/videos/dumbbell-curl',
      },

      // Functional/Athletic
      {
        name: 'Box Jumps',
        description: 'Plyometric exercise for explosive power.',
        targetMuscles: 'Quads, Glutes, Calves',
        imageUrl: 'https://images.unsplash.com/photo-1599058945522-28d584b6f0ff',
        videoUrl: 'https://example.com/videos/box-jumps',
      },
      {
        name: 'Medicine Ball Slam',
        description: 'Explosive full-body exercise for power development.',
        targetMuscles: 'Full Body, Core',
        imageUrl: 'https://images.unsplash.com/photo-1599058945522-28d584b6f0ff',
        videoUrl: 'https://example.com/videos/medicine-ball-slam',
      },
      {
        name: 'Battle Ropes',
        description: 'High-intensity exercise for conditioning and upper body endurance.',
        targetMuscles: 'Shoulders, Arms, Core',
        imageUrl: 'https://images.unsplash.com/photo-1599058945522-28d584b6f0ff',
        videoUrl: 'https://example.com/videos/battle-ropes',
      }
    ]

    // Insert exercises one by one
    for (const exercise of gymExercisesData) {
      // Check if exercise already exists
      const existingExercise = await db.query.exercises.findFirst({
        where: eq(exercises.name, exercise.name),
      })

      // Skip if already exists
      if (existingExercise) {
        console.log(`⚠️ Gym exercise "${exercise.name}" already exists, skipping`)
        continue
      }

      // Insert new exercise
      await db.insert(exercises).values({
        name: exercise.name,
        description: exercise.description,
        targetMuscles: exercise.targetMuscles,
        imageUrl: exercise.imageUrl,
        videoUrl: exercise.videoUrl,
      })
      console.log(`💪 Gym exercise "${exercise.name}" seeded`)
    }

    console.log('✅ Successfully seeded gym exercises')
  } catch (error) {
    if (error instanceof Error) {
      console.error('❌ Error seeding gym exercises:', error.message)
    } else {
      console.error('❌ Error seeding gym exercises:', String(error))
    }
    throw error
  }
} 