import { db } from '../client'
import { workouts, workoutCategories } from '../schema'
import { eq } from 'drizzle-orm'

export async function seedPilatesWorkouts() {
  console.log('🧘‍♀️ Seeding Pilates workouts...')

  try {
    // First, get all category IDs
    const categories = await db.select().from(workoutCategories)
    const categoryMap = new Map(categories.map(cat => [cat.name, cat.id]))

    const pilatesWorkoutData = [
      // Core-focused Pilates
      {
        title: 'Core Control Pilates',
        description: 'A foundational Pilates workout focusing on core strength and stability. Perfect for beginners to establish proper form and breathing techniques.',
        durationMinutes: 30,
        difficultyLevel: 'beginner',
        caloriesBurn: 150,
        rating: '4.8',
        imageUrl: 'https://snatched-ai-bucket.s3.us-east-1.amazonaws.com/workouts/pilates/Core+Control+Pilates.png',
        categoryId: categoryMap.get('Core'),
      },
      {
        title: 'Advanced Core Flow',
        description: 'An intense Pilates session combining classical exercises with advanced variations. Focuses on deep core engagement and precise movements.',
        durationMinutes: 45,
        difficultyLevel: 'advanced',
        caloriesBurn: 250,
        rating: '4.7',
        imageUrl: 'https://snatched-ai-bucket.s3.us-east-1.amazonaws.com/workouts/pilates/Advanced+Core+Flow.png',
        categoryId: categoryMap.get('Core'),
      },
      {
        title: 'Core Stability & Balance',
        description: 'Intermediate Pilates workout focusing on building core stability through balance challenges and controlled movements.',
        durationMinutes: 35,
        difficultyLevel: 'intermediate',
        caloriesBurn: 180,
        rating: '4.7',
        imageUrl: 'https://snatched-ai-bucket.s3.us-east-1.amazonaws.com/workouts/pilates/Core+Stability+%26+Balance.png',
        categoryId: categoryMap.get('Core'),
      },
      {
        title: 'Deep Core Power',
        description: 'Advanced Pilates session targeting deep core muscles with complex movement patterns and longer holds.',
        durationMinutes: 40,
        difficultyLevel: 'advanced',
        caloriesBurn: 220,
        rating: '4.9',
        imageUrl: 'https://snatched-ai-bucket.s3.us-east-1.amazonaws.com/workouts/pilates/Deep+Core+Power.png',
        categoryId: categoryMap.get('Core'),
      },

      // Full Body Pilates
      {
        title: 'Total Body Pilates Sculpt',
        description: 'A comprehensive Pilates workout that targets all major muscle groups while maintaining focus on core engagement and proper alignment.',
        durationMinutes: 40,
        difficultyLevel: 'intermediate',
        caloriesBurn: 200,
        rating: '4.9',
        imageUrl: 'https://snatched-ai-bucket.s3.us-east-1.amazonaws.com/workouts/pilates/Total+Body+Pilates+Sculpt.png',
        categoryId: categoryMap.get('Full Body'),
      },
      {
        title: 'Power Pilates Fusion',
        description: 'Combines traditional Pilates exercises with dynamic movements for a challenging full-body workout that improves strength and flexibility.',
        durationMinutes: 50,
        difficultyLevel: 'advanced',
        caloriesBurn: 280,
        rating: '4.6',
        imageUrl: 'https://snatched-ai-bucket.s3.us-east-1.amazonaws.com/workouts/pilates/Power+Pilates+Fusion.png',
        categoryId: categoryMap.get('Full Body'),
      },
      {
        title: 'Beginner Full Body Flow',
        description: 'A gentle introduction to full-body Pilates movements, focusing on proper form and mind-body connection.',
        durationMinutes: 35,
        difficultyLevel: 'beginner',
        caloriesBurn: 160,
        rating: '4.8',
        imageUrl: 'https://snatched-ai-bucket.s3.us-east-1.amazonaws.com/workouts/pilates/Beginner+Full+Body+Flow.png',
        categoryId: categoryMap.get('Full Body'),
      },
      {
        title: 'Dynamic Full Body Challenge',
        description: 'Advanced full-body workout incorporating flowing sequences and challenging transitions between exercises.',
        durationMinutes: 45,
        difficultyLevel: 'advanced',
        caloriesBurn: 260,
        rating: '4.7',
        imageUrl: 'https://snatched-ai-bucket.s3.us-east-1.amazonaws.com/workouts/pilates/Dynamic+Full+Body+Challenge.png',
        categoryId: categoryMap.get('Full Body'),
      },

      // Lower Body Focus
      {
        title: 'Lower Body Pilates Tone',
        description: 'Focus on strengthening and toning the lower body using Pilates principles. Includes exercises for legs, glutes, and lower core.',
        durationMinutes: 35,
        difficultyLevel: 'intermediate',
        caloriesBurn: 180,
        rating: '4.7',
        imageUrl: 'https://snatched-ai-bucket.s3.us-east-1.amazonaws.com/workouts/pilates/Lower+Body+Pilates+Tone.png',
        categoryId: categoryMap.get('Lower Body'),
      },
      {
        title: 'Pilates Leg Sculptor',
        description: 'An intense lower body Pilates workout that combines traditional exercises with targeted leg work for maximum toning and strengthening.',
        durationMinutes: 40,
        difficultyLevel: 'advanced',
        caloriesBurn: 220,
        rating: '4.8',
        imageUrl: 'https://snatched-ai-bucket.s3.us-east-1.amazonaws.com/workouts/pilates/Pilates+Leg+Sculptor.png',
        categoryId: categoryMap.get('Lower Body'),
      },
      {
        title: 'Gentle Lower Body & Core',
        description: 'A beginner-friendly workout focusing on basic Pilates exercises for lower body strength and stability.',
        durationMinutes: 30,
        difficultyLevel: 'beginner',
        caloriesBurn: 140,
        rating: '4.6',
        imageUrl: 'https://snatched-ai-bucket.s3.us-east-1.amazonaws.com/workouts/pilates/Gentle+Lower+Body+%26+Core.png',
        categoryId: categoryMap.get('Lower Body'),
      },
      {
        title: 'Lower Body Power & Balance',
        description: 'Intermediate workout combining standing Pilates exercises with mat work for comprehensive lower body conditioning.',
        durationMinutes: 45,
        difficultyLevel: 'intermediate',
        caloriesBurn: 200,
        rating: '4.8',
        imageUrl: 'https://snatched-ai-bucket.s3.us-east-1.amazonaws.com/workouts/pilates/Lower+Body+Power+%26+Balance.png',
        categoryId: categoryMap.get('Lower Body'),
      },

      // Upper Body Focus
      {
        title: 'Upper Body Pilates Flow',
        description: 'A focused Pilates session for upper body strength and posture improvement. Emphasizes arm, shoulder, and upper back exercises.',
        durationMinutes: 35,
        difficultyLevel: 'intermediate',
        caloriesBurn: 160,
        rating: '4.6',
        imageUrl: 'https://snatched-ai-bucket.s3.us-east-1.amazonaws.com/workouts/pilates/Upper+Body+Pilates+Flow.png',
        categoryId: categoryMap.get('Upper Body'),
      },
      {
        title: 'Advanced Arm & Core Pilates',
        description: 'Challenging Pilates workout combining upper body strengthening with core stability work. Perfect for building lean, strong arms.',
        durationMinutes: 45,
        difficultyLevel: 'advanced',
        caloriesBurn: 230,
        rating: '4.7',
        imageUrl: 'https://snatched-ai-bucket.s3.us-east-1.amazonaws.com/workouts/pilates/Advanced+Arm+%26+Core+Pilates.png',
        categoryId: categoryMap.get('Upper Body'),
      },
      {
        title: 'Posture Perfect Pilates',
        description: 'Beginner-friendly upper body workout focusing on proper alignment and basic strengthening exercises for better posture.',
        durationMinutes: 30,
        difficultyLevel: 'beginner',
        caloriesBurn: 130,
        rating: '4.8',
        imageUrl: 'https://snatched-ai-bucket.s3.us-east-1.amazonaws.com/workouts/pilates/Posture+Perfect+Pilates.png',
        categoryId: categoryMap.get('Upper Body'),
      },
      {
        title: 'Upper Body Strength & Control',
        description: 'Intermediate workout combining traditional Pilates exercises with focused upper body conditioning for improved strength and control.',
        durationMinutes: 40,
        difficultyLevel: 'intermediate',
        caloriesBurn: 190,
        rating: '4.7',
        imageUrl: 'https://snatched-ai-bucket.s3.us-east-1.amazonaws.com/workouts/pilates/Upper+Body+Strength+%26+Control.png',
        categoryId: categoryMap.get('Upper Body'),
      },

      // HIIT Pilates Fusion
      {
        title: 'Pilates HIIT Blend',
        description: 'A dynamic fusion of Pilates and HIIT principles. Combines controlled Pilates movements with high-intensity intervals for maximum results.',
        durationMinutes: 40,
        difficultyLevel: 'advanced',
        caloriesBurn: 300,
        rating: '4.9',
        imageUrl: 'https://snatched-ai-bucket.s3.us-east-1.amazonaws.com/workouts/pilates/Pilates+HIIT+Blend.png',
        categoryId: categoryMap.get('HIIT'),
      },
      {
        title: 'Power Pilates Intervals',
        description: 'High-energy workout alternating between classical Pilates exercises and cardio intervals. Perfect for building strength and endurance.',
        durationMinutes: 45,
        difficultyLevel: 'advanced',
        caloriesBurn: 320,
        rating: '4.8',
        imageUrl: 'https://snatched-ai-bucket.s3.us-east-1.amazonaws.com/workouts/pilates/Power+Pilates+Intervals.png',
        categoryId: categoryMap.get('HIIT'),
      },

      // Recovery/Cooldown
      {
        title: 'Gentle Pilates Stretch',
        description: 'A restorative Pilates session focusing on gentle stretching and mobility work. Perfect for recovery days or as a cooldown routine.',
        durationMinutes: 25,
        difficultyLevel: 'beginner',
        caloriesBurn: 100,
        rating: '4.8',
        imageUrl: 'https://snatched-ai-bucket.s3.us-east-1.amazonaws.com/workouts/pilates/Gentle+Pilates+Stretch.png',
        categoryId: categoryMap.get('Recovery'),
      },
      {
        title: 'Mind-Body Pilates Flow',
        description: 'A mindful Pilates practice combining breathing techniques with gentle, flowing movements. Focuses on alignment and relaxation.',
        durationMinutes: 30,
        difficultyLevel: 'beginner',
        caloriesBurn: 120,
        rating: '4.7',
        imageUrl: 'https://snatched-ai-bucket.s3.us-east-1.amazonaws.com/workouts/pilates/Mind-Body+Pilates+Flow.png',
        categoryId: categoryMap.get('Recovery'),
      }
    ]

    // Insert workouts one by one
    for (const workout of pilatesWorkoutData) {
      // Skip if category ID is not found
      if (!workout.categoryId) {
        console.warn(`⚠️ Skipping Pilates workout "${workout.title}" - Category not found`)
        continue
      }

      const existingWorkout = await db.query.workouts.findFirst({
        where: eq(workouts.title, workout.title),
      })

      if (existingWorkout) {
        console.warn(`⚠️ Skipping Pilates workout "${workout.title}" - Already exists`)
        continue
      }

      // Insert new workout
      await db.insert(workouts).values(workout)
      console.log(`🧘‍♀️ Pilates workout "${workout.title}" seeded`)
    }

    console.log('✅ Successfully seeded Pilates workouts')
  } catch (error) {
    if (error instanceof Error) {
      console.error('❌ Error seeding Pilates workouts:', error.message)
    } else {
      console.error('❌ Error seeding Pilates workouts:', String(error))
    }
    throw error
  }
} 