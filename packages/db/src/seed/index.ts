import { seedWorkoutCategories } from './workout-categories'
import { seedExercises } from './exercises'
import { seedWorkouts } from './workouts'
import { seedWorkoutExercises } from './workout-exercises'
import { seedRecipeCategories } from './recipe-categories'
import { seedRecipes } from './recipes'
import { seedMoreRecipes } from './more-recipes'
import { seedMilestoneLevels } from './milestone-levels'

export async function seed() {
  console.log('🌱 Starting database seeding...')

  try {
    // Seed in order of dependencies
    await seedWorkoutCategories()
    await seedExercises()
    await seedWorkouts()
    await seedWorkoutExercises()
    
    // Seed recipe data
    await seedRecipeCategories()
    await seedRecipes()
    await seedMoreRecipes()
    
    // Seed milestone levels
    await seedMilestoneLevels()
    
    console.log('✅ Database seeding completed successfully')
  } catch (error) {
    console.error('❌ Error during database seeding:', error)
    process.exit(1)
  }
}

void seed() 