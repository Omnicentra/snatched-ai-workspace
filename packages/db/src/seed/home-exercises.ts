import { db } from '../client'
import { exercises } from '../schema'
import { eq } from 'drizzle-orm'

export async function seedExercises() {
  console.log('🌱 Seeding home exercises...')

  try {
    const exercisesData = [
      // Existing exercises
      {
        name: 'Lunges',
        description: 'A functional exercise that works multiple muscle groups at once.',
        targetMuscles: 'Quads, Glutes, Hamstrings',
        imageUrl: 'https://images.unsplash.com/photo-1566241142559-40e1dab266c6',
        videoUrl: 'https://example.com/videos/lunges',
      },
      {
        name: 'Squats',
        description: 'Compound exercise that primarily targets the quads, hamstrings, and glutes.',
        targetMuscles: 'Quads, Glutes, Hamstrings',
        imageUrl: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155',
        videoUrl: 'https://example.com/videos/squats',
      },
      {
        name: 'Push-ups',
        description: 'Classic bodyweight exercise for upper body strength.',
        targetMuscles: 'Chest, Shoulders, Triceps',
        imageUrl: 'https://images.unsplash.com/photo-1598971639058-a106bc5be7c4',
        videoUrl: 'https://example.com/videos/pushups',
      },
      {
        name: 'Plank',
        description: 'Isometric core exercise that improves stability and posture.',
        targetMuscles: 'Core, Shoulders',
        imageUrl: 'https://images.unsplash.com/photo-1566241142559-40e1dab266c6',
        videoUrl: 'https://example.com/videos/plank',
      },
      {
        name: 'Dumbbell Rows',
        description: 'Strengthens the back and improves posture.',
        targetMuscles: 'Back, Biceps',
        imageUrl: 'https://images.unsplash.com/photo-1598266663439-2056e7d8f93d',
        videoUrl: 'https://example.com/videos/dumbbell-rows',
      },

      // Additional exercises
      // Upper Body
      {
        name: 'Bench Press',
        description: 'Compound exercise for chest strength and development.',
        targetMuscles: 'Chest, Shoulders, Triceps',
        imageUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd',
        videoUrl: 'https://example.com/videos/bench-press',
      },
      {
        name: 'Overhead Press',
        description: 'Vertical pressing movement for shoulder development.',
        targetMuscles: 'Shoulders, Triceps, Upper Chest',
        imageUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e',
        videoUrl: 'https://example.com/videos/overhead-press',
      },
      {
        name: 'Bicep Curls',
        description: 'Isolation exercise targeting the biceps.',
        targetMuscles: 'Biceps',
        imageUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e',
        videoUrl: 'https://example.com/videos/bicep-curls',
      },
      {
        name: 'Tricep Dips',
        description: 'Effective exercise for tricep strength and definition.',
        targetMuscles: 'Triceps, Shoulders',
        imageUrl: 'https://images.unsplash.com/photo-1598971639058-a106bc5be7c4',
        videoUrl: 'https://example.com/videos/tricep-dips',
      },
      {
        name: 'Pull-ups',
        description: 'Compound upper body exercise for back strength.',
        targetMuscles: 'Back, Biceps, Shoulders',
        imageUrl: 'https://images.unsplash.com/photo-1598266663439-2056e7d8f93d',
        videoUrl: 'https://example.com/videos/pull-ups',
      },
      {
        name: 'Lateral Raises',
        description: 'Isolation exercise for shoulder development.',
        targetMuscles: 'Shoulders',
        imageUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e',
        videoUrl: 'https://example.com/videos/lateral-raises',
      },

      // Lower Body
      {
        name: 'Deadlifts',
        description: 'Compound exercise that targets multiple muscle groups.',
        targetMuscles: 'Hamstrings, Glutes, Lower Back',
        imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48',
        videoUrl: 'https://example.com/videos/deadlifts',
      },
      {
        name: 'Romanian Deadlifts',
        description: 'Variation of deadlift focusing on hamstrings and glutes.',
        targetMuscles: 'Hamstrings, Glutes',
        imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48',
        videoUrl: 'https://example.com/videos/romanian-deadlifts',
      },
      {
        name: 'Glute Bridges',
        description: 'Exercise that targets the gluteal muscles.',
        targetMuscles: 'Glutes, Hamstrings',
        imageUrl: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155',
        videoUrl: 'https://example.com/videos/glute-bridges',
      },
      {
        name: 'Calf Raises',
        description: 'Isolation exercise for calf development.',
        targetMuscles: 'Calves',
        imageUrl: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155',
        videoUrl: 'https://example.com/videos/calf-raises',
      },
      {
        name: 'Bulgarian Split Squats',
        description: 'Unilateral exercise for leg development and balance.',
        targetMuscles: 'Quads, Glutes, Hamstrings',
        imageUrl: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155',
        videoUrl: 'https://example.com/videos/bulgarian-split-squats',
      },

      // Core 
      {
        name: 'Crunches',
        description: 'Basic abdominal exercise for core strength.',
        targetMuscles: 'Abs',
        imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b',
        videoUrl: 'https://example.com/videos/crunches',
      },
      {
        name: 'Russian Twists',
        description: 'Core exercise that targets obliques.',
        targetMuscles: 'Obliques, Core',
        imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b',
        videoUrl: 'https://example.com/videos/russian-twists',
      },
      {
        name: 'Side Planks',
        description: 'Variation of plank targeting obliques.',
        targetMuscles: 'Obliques, Core',
        imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b',
        videoUrl: 'https://example.com/videos/side-planks',
      },
      {
        name: 'Mountain Climbers',
        description: 'Dynamic exercise for core and cardio.',
        targetMuscles: 'Core, Shoulders, Hip Flexors',
        imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b',
        videoUrl: 'https://example.com/videos/mountain-climbers',
      },
      {
        name: 'Leg Raises',
        description: 'Core exercise targeting lower abs.',
        targetMuscles: 'Lower Abs',
        imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b',
        videoUrl: 'https://example.com/videos/leg-raises',
      },

      // HIIT/Cardio
      {
        name: 'Burpees',
        description: 'Full-body exercise that elevates heart rate.',
        targetMuscles: 'Full Body',
        imageUrl: 'https://images.unsplash.com/photo-1599058945522-28d584b6f0ff',
        videoUrl: 'https://example.com/videos/burpees',
      },
      {
        name: 'Jumping Jacks',
        description: 'Classic cardio exercise that increases heart rate.',
        targetMuscles: 'Full Body',
        imageUrl: 'https://images.unsplash.com/photo-1599058945522-28d584b6f0ff',
        videoUrl: 'https://example.com/videos/jumping-jacks',
      },
      {
        name: 'High Knees',
        description: 'Cardio exercise that targets core and lower body.',
        targetMuscles: 'Core, Quads',
        imageUrl: 'https://images.unsplash.com/photo-1599058945522-28d584b6f0ff',
        videoUrl: 'https://example.com/videos/high-knees',
      },
      {
        name: 'Box Jumps',
        description: 'Plyometric exercise for explosive power.',
        targetMuscles: 'Quads, Glutes, Calves',
        imageUrl: 'https://images.unsplash.com/photo-1599058945522-28d584b6f0ff',
        videoUrl: 'https://example.com/videos/box-jumps',
      },
      {
        name: 'Jump Rope',
        description: 'Effective cardio exercise for coordination and endurance.',
        targetMuscles: 'Calves, Shoulders',
        imageUrl: 'https://images.unsplash.com/photo-1599058945522-28d584b6f0ff',
        videoUrl: 'https://example.com/videos/jump-rope',
      },

      // Cooldown Exercises
      {
        name: 'Light Walking',
        description: 'A gentle walking exercise to gradually lower heart rate and begin recovery.',
        targetMuscles: 'Full Body',
        imageUrl: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8',
        videoUrl: 'https://example.com/videos/light-walking',
      },
      {
        name: 'Standing Forward Bend',
        description: 'A stretching exercise that targets the hamstrings and lower back, promoting flexibility and relaxation.',
        targetMuscles: 'Hamstrings, Lower Back',
        imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b',
        videoUrl: 'https://example.com/videos/standing-forward-bend',
      },
      {
        name: "Child's Pose",
        description: 'A restorative yoga pose that stretches the back and promotes relaxation.',
        targetMuscles: 'Back, Shoulders',
        imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b',
        videoUrl: 'https://example.com/videos/childs-pose',
      },
      {
        name: 'Deep Breathing',
        description: 'Controlled breathing exercise to reduce heart rate and promote recovery.',
        targetMuscles: 'Core',
        imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b',
        videoUrl: 'https://example.com/videos/deep-breathing',
      },
    ]

    // Insert exercises one by one
    for (const exercise of exercisesData) {
      // Check if exercise already exists
      const existingExercise = await db.query.exercises.findFirst({
        where: eq(exercises.name, exercise.name),
      })

      // Skip if already exists
      if (existingExercise) {
        console.log(`⚠️ Exercise "${exercise.name}" already exists, skipping`)
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
    }

    console.log('✅ Successfully seeded exercises')
  } catch (error) {
    if (error instanceof Error) {
      console.error('❌ Error seeding exercises:', error.message)
    } else {
      console.error('❌ Error seeding exercises:', String(error))
    }
    throw error
  }
} 