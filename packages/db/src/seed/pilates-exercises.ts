import { db } from '../client'
import { exercises } from '../schema'
import { eq } from 'drizzle-orm'

export async function seedPilatesExercises() {
  console.log('🧘‍♀️ Seeding Pilates exercises...')

  try {
    const pilatesExercisesData = [
      {
        name: 'The Hundred',
        description: 'A classic Pilates warm-up exercise that strengthens the core while improving breath control.',
        targetMuscles: 'Core, Hip Flexors, Neck',
        imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b',
        videoUrl: 'https://example.com/videos/pilates-hundred',
      },
      {
        name: 'Roll Up',
        description: 'A movement that strengthens the abdominal muscles while improving spinal articulation.',
        targetMuscles: 'Abs, Lower Back, Hip Flexors',
        imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b',
        videoUrl: 'https://example.com/videos/roll-up',
      },
      {
        name: 'Single Leg Circles',
        description: 'An exercise that improves hip mobility while strengthening the core and leg muscles.',
        targetMuscles: 'Hip Flexors, Core, Legs',
        imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b',
        videoUrl: 'https://example.com/videos/single-leg-circles',
      },
      {
        name: 'Rolling Like a Ball',
        description: 'A massage-like movement that improves balance and spinal flexibility.',
        targetMuscles: 'Core, Back, Shoulders',
        imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b',
        videoUrl: 'https://example.com/videos/rolling-like-ball',
      },
      {
        name: 'Single Leg Stretch',
        description: 'Core-focused exercise that also improves coordination and leg strength.',
        targetMuscles: 'Core, Hip Flexors, Legs',
        imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b',
        videoUrl: 'https://example.com/videos/single-leg-stretch',
      },
      {
        name: 'Double Leg Stretch',
        description: 'Advanced core exercise that challenges coordination and stability.',
        targetMuscles: 'Core, Hip Flexors, Shoulders',
        imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b',
        videoUrl: 'https://example.com/videos/double-leg-stretch',
      },
      {
        name: 'Spine Stretch Forward',
        description: 'Stretching exercise that improves spinal flexibility and hamstring length.',
        targetMuscles: 'Back, Hamstrings, Core',
        imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b',
        videoUrl: 'https://example.com/videos/spine-stretch-forward',
      },
      {
        name: 'Saw',
        description: 'Rotation exercise that improves spine mobility and stretches the back muscles.',
        targetMuscles: 'Obliques, Back, Hamstrings',
        imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b',
        videoUrl: 'https://example.com/videos/saw',
      },
      {
        name: 'Swan Dive',
        description: 'Back extension exercise that strengthens the posterior chain.',
        targetMuscles: 'Back, Glutes, Shoulders',
        imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b',
        videoUrl: 'https://example.com/videos/swan-dive',
      },
      {
        name: 'Teaser',
        description: 'Advanced exercise that challenges full-body control and balance.',
        targetMuscles: 'Core, Hip Flexors, Back',
        imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b',
        videoUrl: 'https://example.com/videos/teaser',
      },
      {
        name: 'Side Kicks',
        description: 'Lateral movement that strengthens the outer thighs and improves hip stability.',
        targetMuscles: 'Hip Abductors, Obliques, Core',
        imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b',
        videoUrl: 'https://example.com/videos/side-kicks',
      },
      {
        name: 'Corkscrew',
        description: 'Advanced core exercise that challenges rotational control and stability.',
        targetMuscles: 'Core, Obliques, Hip Flexors',
        imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b',
        videoUrl: 'https://example.com/videos/corkscrew',
      },
      {
        name: 'Open Leg Rocker',
        description: 'Balance exercise that strengthens the core while improving flexibility.',
        targetMuscles: 'Core, Back, Hip Flexors',
        imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b',
        videoUrl: 'https://example.com/videos/open-leg-rocker',
      },
      {
        name: 'Jack Knife',
        description: 'Advanced exercise that develops core strength and shoulder stability.',
        targetMuscles: 'Core, Shoulders, Hip Flexors',
        imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b',
        videoUrl: 'https://example.com/videos/jack-knife',
      },
      {
        name: 'Boomerang',
        description: 'Complex movement that combines rotation, extension, and balance.',
        targetMuscles: 'Core, Back, Hip Flexors, Obliques',
        imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b',
        videoUrl: 'https://example.com/videos/boomerang',
      },
      {
        name: 'Plank to Pike',
        description: 'Dynamic movement combining core stability with shoulder strength.',
        targetMuscles: 'Core, Shoulders, Upper Back',
        imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b',
        videoUrl: 'https://example.com/videos/plank-to-pike',
      },
      {
        name: 'Double Leg Kicks',
        description: 'Prone exercise that strengthens the back while improving shoulder mobility and spinal extension.',
        targetMuscles: 'Back, Glutes, Shoulders, Hamstrings',
        imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b',
        videoUrl: 'https://example.com/videos/double-leg-kicks',
      },
      {
        name: 'Push-Up to Plank',
        description: 'Upper body strengthening exercise with focus on control and alignment.',
        targetMuscles: 'Chest, Shoulders, Core',
        imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b',
        videoUrl: 'https://example.com/videos/push-up-plank',
      },
      {
        name: 'Shoulder Bridge',
        description: 'Spine articulation exercise that strengthens the posterior chain.',
        targetMuscles: 'Glutes, Lower Back, Hamstrings',
        imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b',
        videoUrl: 'https://example.com/videos/shoulder-bridge',
      },
      {
        name: 'Seal',
        description: 'Rolling exercise that massages the spine and challenges balance.',
        targetMuscles: 'Core, Back, Hip Flexors',
        imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b',
        videoUrl: 'https://example.com/videos/seal',
      }
    ]

    // Insert exercises one by one
    for (const exercise of pilatesExercisesData) {
      // Check if exercise already exists
      const existingExercise = await db.query.exercises.findFirst({
        where: eq(exercises.name, exercise.name),
      })

      // Skip if already exists
      if (existingExercise) {
        console.log(`⚠️ Pilates exercise "${exercise.name}" already exists, skipping`)
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
      console.log(`🧘‍♀️ Pilates exercise "${exercise.name}" seeded`)
    }

    console.log('✅ Successfully seeded Pilates exercises')
  } catch (error) {
    if (error instanceof Error) {
      console.error('❌ Error seeding Pilates exercises:', error.message)
    } else {
      console.error('❌ Error seeding Pilates exercises:', String(error))
    }
    throw error
  }
} 