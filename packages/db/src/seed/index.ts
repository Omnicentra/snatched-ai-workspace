import { seedWorkoutCategories } from './workout-categories'
import { seedExercises } from './exercises'
import { seedWorkouts } from './workouts'
import { seedWorkoutExercises } from './workout-exercises'

async function main() {
  console.log('🌱 Starting database seeding...')

  try {
    // Seed in order of dependencies
    await seedWorkoutCategories()
    await seedExercises()
    await seedWorkouts()
    await seedWorkoutExercises()
    
    console.log('✅ Database seeding completed successfully')
  } catch (error) {
    console.error('❌ Error during database seeding:', error)
    process.exit(1)
  }
}

void main() 