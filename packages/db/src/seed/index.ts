import { seedWorkoutCategories } from "./workout-categories";
import { seedExercises } from "./home-exercises";
import { seedWorkouts } from "./home-workouts";
import { seedHomeWorkoutExercises } from "./home-workout-exercises";
import { seedRecipeCategories } from "./recipe-categories";
import { seedRecipes } from "./recipes";
import { seedMoreRecipes } from "./more-recipes";
import { seedSnatchHacks } from "./snatch-hacks";
import { seedMilestoneLevels } from "./milestone-levels";
import { seedWorkoutClasses } from "./workout-classes";
import { seedPilatesExercises } from "./pilates-exercises";
import { seedPilatesWorkouts } from "./pilates-workouts";
import { seedPilatesWorkoutExercises } from "./pilates-workout-exercises";
import { seedGymWorkouts } from "./gym-workouts";
import { seedGymExercises } from "./gym-exercises";
import { seedGymWorkoutExercises } from "./gym-workout-exercises";

const seedFunctions = {
	"workout-categories": seedWorkoutCategories,
	"workout-classes": seedWorkoutClasses,
	"home-exercises": seedExercises,
	"pilates-exercises": seedPilatesExercises,
	"gym-exercises": seedGymExercises,
	"home-workouts": seedWorkouts,
	"pilates-workouts": seedPilatesWorkouts,
	"gym-workouts": seedGymWorkouts,
	"home-workout-exercises": seedHomeWorkoutExercises,
	"pilates-workout-exercises": seedPilatesWorkoutExercises,
	"gym-workout-exercises": seedGymWorkoutExercises,
	"recipe-categories": seedRecipeCategories,
	"recipes": seedRecipes,
	"more-recipes": seedMoreRecipes,
	"snatch-hacks": seedSnatchHacks,
	"milestone-levels": seedMilestoneLevels,
} as const;

type SeedFunction = keyof typeof seedFunctions;

async function runSingleSeed(seedName: SeedFunction) {
	console.log(`🌱 Running seed: ${seedName}`);
	try {
		await seedFunctions[seedName]();
		console.log(`✅ Successfully seeded: ${seedName}`);
	} catch (error) {
		console.error(`❌ Error seeding ${seedName}:`, error);
		process.exit(1);
	}
}

export async function seed() {
	const specificSeed = process.argv[2]?.replace("--", "");
	
	if (specificSeed && specificSeed in seedFunctions) {
		await runSingleSeed(specificSeed as SeedFunction);
		return;
	}

	console.log("🌱 Starting full database seeding...");

	try {
		// Seed in order of dependencies
		await seedWorkoutCategories();
		await seedWorkoutClasses();

		// Seed exercises
		await seedExercises();
		await seedPilatesExercises();
		await seedGymExercises();

		// Seed workouts
		await seedWorkouts();
		await seedPilatesWorkouts();
		await seedGymWorkouts();

		// Seed workout exercises
		await seedHomeWorkoutExercises();
		await seedPilatesWorkoutExercises();
		await seedGymWorkoutExercises();

		// Seed recipe data
		await seedRecipeCategories();
		await seedRecipes();
		await seedMoreRecipes();

		// Seed snatch hacks
		await seedSnatchHacks();

		// Seed milestone levels
		await seedMilestoneLevels();

		console.log("✅ Database seeding completed successfully");
	} catch (error) {
		console.error("❌ Error during database seeding:", error);
		process.exit(1);
	}
}

void seed();
